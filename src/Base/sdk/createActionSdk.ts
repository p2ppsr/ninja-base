/* eslint-disable @typescript-eslint/no-unused-vars */
import { OutPoint, sdk, TrustSelf, WERR_INTERNAL } from "@babbage/sdk-ts";
import { NinjaBase } from "../NinjaBase";
import { asBsvSdkScript, asBsvSdkTx, DojoCreateTransactionResultApi, DojoCreateTxResultInputsApi, DojoCreateTxResultInstructionsApi, DojoOutputToRedeemApi, ERR_INTERNAL, ERR_INVALID_PARAMETER, ERR_NOT_IMPLEMENTED, ScriptTemplateSABPPP, verifyTruthy } from "cwi-base";
import { KeyPairApi } from "../../Api/NinjaApi";
import { Beef, PrivateKey, Script, Transaction, TransactionInput, TransactionOutput } from "@bsv/sdk";

interface CreateActionSdkResults {
    sdk: sdk.CreateActionResult
    dojoCreate?: DojoCreateTransactionResultApi
}

export async function createActionSdk(ninja: NinjaBase, args: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameString)
: Promise<sdk.CreateActionResult> {
  
  const results: CreateActionSdkResults = {
    sdk: {},
    dojoCreate: undefined
  }

  if (args.isNewTx) {
    const dojoArgs = removeUnlockScripts(args);
    results.dojoCreate = await ninja.dojo.createActionUnsigned(dojoArgs, originator)

    if (args.isSignAction) {
      addUnsignedTransactionResult(results, ninja, args)
      // isSendWith is ignored, can happen in signAction
      return results.sdk
    }

    addSignedTransactionResult(results, ninja, args)

    if (args.isDelayed) {
      await processNewTransactionDelayed(results, ninja, args)
    } else {
      await processNewTransactionNow(results, ninja, args)
    }
  }

  if (args.isSendWidth) {
    if (args.isDelayed) {
      await processSendWithTransactionDelayed(results, ninja, args)
    } else {
      await processSendWithTransactionNow(results, ninja, args)
    }
  }

  return results.sdk
}

function addUnsignedTransactionResult(results: CreateActionSdkResults, ninja: NinjaBase, args: sdk.ValidCreateActionArgs) {

  const dcr = results.dojoCreate!

  const { tx, amount, log } = buildUnsignedTransaction(dcr, args)

  const beef = Beef.fromBinary(dcr.inputBeef!)
  beef.mergeTransaction(tx)
  const atomicTx = beef.findTransactionForSigning(tx.id('hex'))

  results.sdk.signableTransaction = {
    reference: results.dojoCreate!.referenceNumber,
    tx: atomicTx!.toAtomicBEEF()
  }
}


function addSignedTransactionResult(results: CreateActionSdkResults, ninja: NinjaBase, args: sdk.ValidCreateActionArgs) {
  throw new Error("Function not implemented.");
}


function processNewTransactionDelayed(results: CreateActionSdkResults, ninja: NinjaBase, args: sdk.ValidCreateActionArgs) {
  throw new Error("Function not implemented.");
}


function processNewTransactionNow(results: CreateActionSdkResults, ninja: NinjaBase, args: sdk.ValidCreateActionArgs) {
  throw new Error("Function not implemented.");
}


function processSendWithTransactionDelayed(results: CreateActionSdkResults, ninja: NinjaBase, args: sdk.ValidCreateActionArgs) {
  throw new Error("Function not implemented.");
}


function processSendWithTransactionNow(results: CreateActionSdkResults, ninja: NinjaBase, args: sdk.ValidCreateActionArgs) {
  throw new Error("Function not implemented.");
}

function validateUnlockScriptWithBsvSdk(tx: Transaction, vin: number, lockingScript: Script, amount: number): boolean {
  throw new Error("Function not implemented.");
}

function removeUnlockScripts(args: sdk.ValidCreateActionArgs) {
  let dojoArgs = args
  if (!dojoArgs.inputs.every(i => i.unlockingScript === undefined)) {
    // Never send unlocking scripts to dojo, all it needs is the script length.
    dojoArgs = { ...args, inputs: [] };
    for (const i of args.inputs) {
      const di: sdk.ValidCreateActionInput = {
        ...i,
        unlockingScriptLength: i.unlockingScript !== undefined ? i.unlockingScript.length : i.unlockingScriptLength
      };
      delete di.unlockingScript;
      dojoArgs.inputs.push(di);
    }
  }
  return dojoArgs;
}

function buildUnsignedTransaction(dctr: DojoCreateTransactionResultApi, args: sdk.ValidCreateActionArgs, changeKeys?: KeyPairApi)
: {
  tx: Transaction,
  amount: number,
  log: string
}
{

  let isDummyKeys: boolean = false

  if (!changeKeys) {
    // Use dummy keys to create invalid scripts of expected size.
    isDummyKeys = true
    const privateKey = '0'.repeat(64)
    const priv = PrivateKey.fromString(privateKey, 'hex')
    changeKeys = { privateKey, publicKey: priv.toPublicKey().toString() }
  }

  const {
    inputs: dojoInputs,
    outputs: dojoOutputs,
    derivationPrefix,
    log
  } = dctr;

  const tx = new Transaction(args.version, [], [], args.lockTime);

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
      ScriptTemplateSABPPP.length
      output = {
        satoshis: out.satoshis,
        lockingScript: sabppp.lock(changeKeys.privateKey, changeKeys.publicKey),
        change: true
      };
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

  const inputs: {
    sdk: sdk.ValidCreateActionInput | undefined,
    input: DojoCreateTxResultInputsApi,
    otr: DojoOutputToRedeemApi,
    instructions: DojoCreateTxResultInstructionsApi | undefined 
  }[] = []
  for (const [inputTXID, input] of Object.entries(dojoInputs)) {
    for (const otr of input.outputsToRedeem) {
      const sdk = (otr.vin !== undefined && otr.vin < args.inputs.length) ? args.inputs[otr.vin] : undefined
      inputs.push({ sdk, input, otr, instructions: input.instructions[otr.index] })
    }
  }
  inputs.sort((a, b) => a.otr.vin! < b.otr.vin! ? -1 : a.otr.vin! === b.otr.vin! ? 0 : 1)

  //////////////
  // Add INPUTS
  /////////////
  let totalChangeInputs = 0
  for (const { input, otr, instructions, sdk } of inputs) {

    // Two types of inputs are handled: user specified wth unlockingScript and dojo specified using SABPPP template.
    if (sdk) {
      // Type1: An already signed unlock script is provided as a hex string in otrNinja.unlockingScript
      const inputToAdd: TransactionInput = {
        sourceTXID: sdk.outpoint.txid,
        sourceOutputIndex: sdk.outpoint.vout,
        unlockingScript: asBsvSdkScript(sdk.unlockingScript ? sdk.unlockingScript : '00'.repeat(sdk.unlockingScriptLength!)),
        sequence: sdk.sequenceNumber
      };
      tx.addInput(inputToAdd);
    } else {
      // Type2: SABPPP protocol inputs which are signed using ScriptTemplateSABPPP.
      if (!instructions)
        throw new ERR_INVALID_PARAMETER('instructions', `specified for dojoInput vin ${otr.vin}`);
      if (instructions.type !== 'P2PKH')
        throw new ERR_INVALID_PARAMETER('instructions.type', `vin ${otr.vin}, "${instructions.type}" is not a supported unlocking script type.`);

      // Sign inputs using type42 derived key
      const sabppp = new ScriptTemplateSABPPP({
        derivationPrefix: verifyTruthy(instructions.derivationPrefix),
        derivationSuffix: verifyTruthy(instructions.derivationSuffix)
      });
      const inputToAdd: TransactionInput = {
        sourceTXID: input.txid,
        sourceOutputIndex: otr.index,
        unlockingScriptTemplate: sabppp.unlock(changeKeys.privateKey, verifyTruthy(instructions.senderIdentityKey)),
        sequence: 0xffffffff
      };
      tx.addInput(inputToAdd);
      totalChangeInputs += verifyTruthy(otr.satoshis);
    }
  }

  // The amount is the total of non-foreign inputs minus change outputs
  // Note that the amount can be negative when we are redeeming more inputs than we are spending
  const totalChangeOutputs = dojoOutputs.filter(x => x.purpose === 'change').reduce((acc, el) => acc + el.satoshis, 0);
  const amount = totalChangeInputs - totalChangeOutputs;

  return {
    tx,
    amount,
    log: ''
  };
}