import { Script, Transaction, TransactionInput, TransactionOutput } from '@bsv/sdk';
import { KeyPairApi, NinjaTxInputsApi } from '../Api/NinjaApi';
import { CwiError, DojoCreateTransactionResultApi, ERR_INTERNAL, ERR_INVALID_PARAMETER, ScriptTemplateSABPPP, asBsvSdkScript, asBsvSdkTx, validateUnlockScriptWithBsvSdk, verifyTruthy } from 'cwi-base';
import { ERR_NINJA_INVALID_UNLOCK, ERR_NINJA_MISSING_UNLOCK } from '../ERR_NINJA_errors';

/**
 * Constructs a @bsv/sdk `Transaction` from Ninja inputs and Dojo create transaction results. 
 * 
 * @param ninjaInputs Ninja inputs as passed to createAction
 * @param createResult Create transaction results returned by dojo createTransaction
 * @param changeKeys Dummy keys can be used to create a transaction with which to generate Ninja input lockingScripts.
 */
export async function buildBsvTxFromCreateTransactionResult(
  ninjaInputs: Record<string, NinjaTxInputsApi>,
  createResult: DojoCreateTransactionResultApi,
  changeKeys: KeyPairApi
): Promise<{
  tx: Transaction;
  outputMap: Record<string, number>;
  amount: number;
  log?: string;
}> {
  const {
    inputs: dojoInputs,
    outputs: dojoOutputs,
    derivationPrefix,
    version,
    lockTime,
    log
  } = createResult;

  const tx = new Transaction(version, [], [], lockTime);

  const outputMap: Record<string, number> = {};

  //////////////
  // Add OUTPUTS
  /////////////
  for (const [i, out] of dojoOutputs.entries()) {
    if (i !== out.vout)
      throw new ERR_INVALID_PARAMETER('output.vout', `equal to array index. ${out.vout} !== ${i}`)

    // Add requested outputs to new bitcoin transaction tx
    let output: TransactionOutput;

    if (out.providedBy === 'dojo' && out.purpose === 'change') {

      // Derive a change output locking script
      const derivationSuffix = verifyTruthy(out.derivationSuffix);
      const sabppp = new ScriptTemplateSABPPP({ derivationPrefix, derivationSuffix });
      output = {
        satoshis: out.satoshis,
        lockingScript: sabppp.lock(changeKeys.privateKey, changeKeys.publicKey),
        change: true
      };

      outputMap[derivationSuffix] = i;
    } else {
      // Add transaction output with external supplied locking script.
      output = {
        satoshis: out.satoshis,
        lockingScript: asBsvSdkScript(out.script),
        change: false
      };
    }
    tx.addOutput(output);
  }

  const getIndex = (o: (number | { index: number; })): number => {
    if (typeof o === 'object') {
      return o.index;
    } else {
      return o;
    }
  };

  const unlockScriptsToVerify: {
    lockingScript: Script;
    vin: number;
    amount: number;
  }[] = [];

  //////////////
  // Add INPUTS
  /////////////
  let totalInputs = 0; // Total of non-ninjaInputs (not specified as an outputToRedeem in ninjaInputs)

  let vin = -1;
  for (const [inputTXID, input] of Object.entries(dojoInputs)) {
    // For each transaction supplying inputs...
    const txInput = asBsvSdkTx(verifyTruthy(input.rawTx)); // transaction referenced by input "outpoint" (txid,vout)
    if (txInput.id("hex") !== inputTXID)
      throw new ERR_INVALID_PARAMETER("rawTx", `match txid. Hash of rawTx is not equal to input txid ${inputTXID}`);

    for (const otr of input.outputsToRedeem) {
      vin++;
      // For each output being redeemed from that input transaction
      const otrIndex = getIndex(otr);
      const otrOutput = txInput.outputs[otrIndex]; // the bitcoin transaction output being spent by new transaction


      // Find this input in ninjaInputs to find if an already signed unlocking script was provided.
      const otrNinja = ninjaInputs[inputTXID]?.outputsToRedeem.find(x => x.index === otrIndex);

      if (otrNinja && typeof otrNinja.unlockingScript !== 'string')
        throw new ERR_INVALID_PARAMETER("unlockingScript", `hex string for vin ${vin}`);

      unlockScriptsToVerify.push({
        vin,
        lockingScript: otrOutput.lockingScript,
        amount: verifyTruthy(otrOutput.satoshis)
      });

      // Two types of inputs are handled:
      // Type1: An already signed unlock script is provided as a hex string in otrNinja.unlockingScript
      // Type2: SABPPP protocol inputs which are signed using ScriptTemplateSABPPP.
      // 
      if (typeof otrNinja?.unlockingScript === 'string') {
        // Type1
        const inputToAdd: TransactionInput = {
          sourceTransaction: txInput,
          sourceTXID: inputTXID,
          sourceOutputIndex: otrIndex,
          unlockingScript: asBsvSdkScript(otrNinja.unlockingScript),
          sequence: otrNinja.sequenceNumber || 0xffffffff
        };
        tx.addInput(inputToAdd);
      } else if (!otrNinja) {
        // Type2
        const instructions = input.instructions ? input.instructions[otrIndex] : undefined;
        if (!instructions)
          throw new ERR_INVALID_PARAMETER('instructions', `specified for dojoInput vin ${vin}`);
        if (instructions.type !== 'P2PKH')
          throw new ERR_INVALID_PARAMETER('instructions.type', `vin ${vin}, "${instructions.type}" is not a supported unlocking script type.`);

        // Sign inputs using type42 derived key
        const sabppp = new ScriptTemplateSABPPP({
          derivationPrefix: verifyTruthy(instructions.derivationPrefix),
          derivationSuffix: verifyTruthy(instructions.derivationSuffix)
        });
        const inputToAdd: TransactionInput = {
          sourceTransaction: txInput,
          sourceTXID: inputTXID,
          sourceOutputIndex: otrIndex,
          unlockingScriptTemplate: sabppp.unlock(changeKeys.privateKey, verifyTruthy(instructions.senderIdentityKey)),
          sequence: 0xffffffff
        };
        tx.addInput(inputToAdd);
        totalInputs += verifyTruthy(otrOutput.satoshis);
      } else {
        throw new ERR_INTERNAL(`unhandled input type ${vin}`);
      }
    }
  }

  // Have all the unlockingScriptTemplates generate their unlockingScripts...
  await tx.sign();

  ///////////////////////////
  // Verify unlocking scripts
  ///////////////////////////
  for (const [i, txin] of tx.inputs.entries()) {
    const vus = unlockScriptsToVerify.find(v => v.vin === i);
    if (!vus)
      throw new ERR_NINJA_MISSING_UNLOCK(i);
    let e: CwiError | undefined = undefined;
    let ok = false;
    try {
      ok = validateUnlockScriptWithBsvSdk(tx, vus.vin, vus.lockingScript, vus.amount);
    } catch (eu: unknown) {
      e = CwiError.fromUnknown(eu);
    }
    if (!ok || e) {
      const rawTx = tx.toHex();
      throw new ERR_NINJA_INVALID_UNLOCK(vus.vin, txin.sourceTXID || '', txin.sourceOutputIndex, rawTx, e);
    }
  }

  // The amount is the total of non-foreign inputs minus change outputs
  // Note that the amount can be negative when we are redeeming more inputs than we are spending
  const totalOutputs = dojoOutputs.filter(x => x.purpose === 'change').reduce((acc, el) => acc + el.satoshis, 0);
  const amount = totalInputs - totalOutputs;

  // The following have not yet been set, default values:
  // tx.version = 1
  // tx.nLockTime =  0
  return {
    tx,
    outputMap,
    amount,
    log
  };
}
