/* eslint-disable @typescript-eslint/no-unused-vars */
import { OutPoint, sdk, TrustSelf, WERR_INTERNAL } from "@babbage/sdk-ts";
import { NinjaBase } from "../NinjaBase";
import { asBsvSdkScript, asBsvSdkTx, DojoCreateTransactionResultApi, DojoCreateTxResultInputsApi, DojoCreateTxResultInstructionsApi, DojoCreateTxResultOutputApi, DojoOutputToRedeemApi, ERR_INTERNAL, ERR_INVALID_PARAMETER, ERR_NOT_IMPLEMENTED, ScriptTemplateSABPPP, verifyTruthy } from "cwi-base";
import { KeyPairApi } from "../../Api/NinjaApi";
import { Beef, PrivateKey, Script, Transaction, TransactionInput, TransactionOutput } from "@bsv/sdk";

interface CreateActionSdkResults {
    sdk: sdk.CreateActionResult
    dojoCreate?: DojoCreateTransactionResultApi
}

export async function createActionSdk(ninja: NinjaBase, args: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameString)
: Promise<CreateActionSdkResults> {
  
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
      return results
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

  return results
}

function addUnsignedTransactionResult(results: CreateActionSdkResults, ninja: NinjaBase, args: sdk.ValidCreateActionArgs) {

  const dcr = results.dojoCreate!
  const reference = dcr.referenceNumber

  const { tx, amount, log } = buildSignableTransaction(dcr, args, ninja.getClientChangeKeyPair())

  const beef = Beef.fromBinary(dcr.inputBeef!)
  beef.mergeTransaction(tx)
  const atomicBeef = beef.toBinaryAtomic(tx.id('hex'))
  
  results.sdk.signableTransaction = {
    reference,
    tx: atomicBeef
  }

  ninja.pendingSignActions[dcr.referenceNumber] = { reference, dcr, args, amount, tx }
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

function buildSignableTransaction(
  dctr: DojoCreateTransactionResultApi,
  args: sdk.ValidCreateActionArgs,
  changeKeys: KeyPairApi
)
: { tx: Transaction, amount: number, log: string }
{

  const {
    inputs: dojoInputs,
    outputs: dojoOutputs,
  } = dctr;

  const tx = new Transaction(args.version, [], [], args.lockTime);

  //////////////
  // Add OUTPUTS
  /////////////
  for (const [i, out] of dojoOutputs.entries()) {
    if (i !== out.vout)
      throw new ERR_INVALID_PARAMETER('output.vout', `equal to array index. ${out.vout} !== ${i}`)

    const change = out.providedBy === 'dojo' && out.purpose === 'change'

    const lockingScript = change ? makeChangeLock(out, dctr, args, changeKeys) : asBsvSdkScript(out.script)

    const output = {
      satoshis: out.satoshis,
      lockingScript,
      change
    }
    tx.addOutput(output);
  }

  //////////////
  // Merge and sort INPUTS info by vin order.
  /////////////
  const inputs: {
    argsInput: sdk.ValidCreateActionInput | undefined,
    dojoInput: DojoCreateTxResultInputsApi,
    otr: DojoOutputToRedeemApi,
    instructions: DojoCreateTxResultInstructionsApi | undefined 
  }[] = []
  for (const [inputTXID, dojoInput] of Object.entries(dojoInputs)) {
    for (const otr of dojoInput.outputsToRedeem) {
      const argsInput = (otr.vin !== undefined && otr.vin < args.inputs.length) ? args.inputs[otr.vin] : undefined
      inputs.push({ argsInput, dojoInput, otr, instructions: dojoInput.instructions[otr.index] })
    }
  }
  inputs.sort((a, b) => a.otr.vin! < b.otr.vin! ? -1 : a.otr.vin! === b.otr.vin! ? 0 : 1)

  //////////////
  // Add INPUTS
  /////////////
  let totalChangeInputs = 0
  for (const { dojoInput, otr, instructions, argsInput } of inputs) {
    // Two types of inputs are handled: user specified wth/without unlockingScript and dojo specified using SABPPP template.
    if (argsInput) {
      // Type 1: User supplied input, with or without an explicit unlockingScript.
      // If without, signAction must be used to provide the actual unlockScript.
      const hasUnlock = typeof argsInput.unlockingScript === 'string'
      const unlock = hasUnlock ? asBsvSdkScript(argsInput.unlockingScript!) : new Script()
      const inputToAdd: TransactionInput = {
        sourceTXID: argsInput.outpoint.txid,
        sourceOutputIndex: argsInput.outpoint.vout,
        unlockingScript: unlock,
        sequence: argsInput.sequenceNumber
      };
      tx.addInput(inputToAdd);
    } else {
      // Type2: SABPPP protocol inputs which are signed using ScriptTemplateSABPPP.
      if (!instructions)
        throw new ERR_INVALID_PARAMETER('instructions', `specified for dojoInput vin ${otr.vin}`);
      if (instructions.type !== 'P2PKH')
        throw new ERR_INVALID_PARAMETER('instructions.type', `vin ${otr.vin}, "${instructions.type}" is not a supported unlocking script type.`);

      const inputToAdd: TransactionInput = {
        sourceTXID: dojoInput.txid,
        sourceOutputIndex: otr.index,
        unlockingScript: new Script(),
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

/**
 * Derive a change output locking script
 */
function makeChangeLock(
  out: DojoCreateTxResultOutputApi,
  dctr: DojoCreateTransactionResultApi,
  args: sdk.ValidCreateActionArgs,
  changeKeys: KeyPairApi)
: Script
{
  const derivationPrefix = dctr.derivationPrefix
  const derivationSuffix = verifyTruthy(out.derivationSuffix);
  const sabppp = new ScriptTemplateSABPPP({ derivationPrefix, derivationSuffix });
  const lockingScript = sabppp.lock(changeKeys.privateKey, changeKeys.publicKey)
  return lockingScript
}
