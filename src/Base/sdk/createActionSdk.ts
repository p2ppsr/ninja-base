/* eslint-disable @typescript-eslint/no-unused-vars */
import { sdk, WERR_INTERNAL } from "@babbage/sdk-ts";
import { NinjaBase } from "../NinjaBase";
import {
  asBsvSdkScript,
  DojoCreateTransactionResultApi,
  DojoCreateTxResultInputsApi,
  DojoCreateTxResultInstructionsApi,
  DojoCreateTxResultOutputApi,
  DojoOutputToRedeemApi,
  DojoProcessActionSdkParams,
  DojoProcessActionSdkResults,
  ERR_INVALID_PARAMETER,
  ScriptTemplateSABPPP,
  verifyTruthy
} from "cwi-base";
import { KeyPairApi } from "../../Api/NinjaApi";
import { Script, Transaction, TransactionInput } from "@bsv/sdk";
import { completeSignedTransaction, makeAtomicBeef } from "./signActionSdk";

export interface PendingDojoInput {
  vin: number,
  derivationPrefix: string,
  derivationSuffix: string,
  unlockerPubKey: string,
  sourceSatoshis: number,
  lockingScript: string
}

export interface PendingSignAction {
  reference: string
  dcr: DojoCreateTransactionResultApi
  args: sdk.ValidCreateActionArgs
  tx: Transaction
  amount: number
  pdi: PendingDojoInput[]
}

export async function createActionSdk(ninja: NinjaBase, vargs: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameString)
: Promise<sdk.CreateActionResult>
{
  const r: sdk.CreateActionResult = {}
  
  let prior: PendingSignAction | undefined = undefined

  if (vargs.isNewTx) {
    prior = await createNewTx(ninja, vargs, originator)

    if (vargs.isSignAction) {
      return makeSignableTransactionResult(prior, ninja, vargs)
    }

    prior.tx = await completeSignedTransaction(prior, {}, ninja)

    r.txid = prior.tx.id('hex')
    if (!vargs.options.returnTXIDOnly)
      r.tx = makeAtomicBeef(prior.tx, prior.dcr.inputBeef!)
  }

  r.sendWithResults = await processActionSdk(prior, ninja, vargs, originator)

  return r
}

function makeSignableTransactionResult(prior: PendingSignAction, ninja: NinjaBase, args: sdk.ValidCreateActionArgs)
: sdk.CreateActionResult
{
  if (!prior.dcr.inputBeef)
    throw new WERR_INTERNAL('prior.dcr.inputBeef must be valid')

  const r: sdk.SignableTransaction = {
    reference: prior.dcr.referenceNumber,
    tx: makeAtomicBeef(prior.tx, prior.dcr.inputBeef)
  }

  ninja.pendingSignActions[r.reference] = prior

  return { signableTransaction: r }
}

export async function processActionSdk(prior: PendingSignAction | undefined, ninja: NinjaBase, args: sdk.ValidProcessActionArgs, originator?: sdk.OriginatorDomainNameString)
: Promise<sdk.SendWithResult[] | undefined>
{
  const params: DojoProcessActionSdkParams = {
    isNewTx: args.isNewTx,
    isSendWith: args.isSendWidth,
    isNoSend: args.isNoSend,
    isDelayed: args.isDelayed,
    reference: prior ? prior.reference : undefined,
    txid: prior ? prior.tx.id('hex') : undefined,
    rawTx: prior ? prior.tx.toBinary() : undefined,
    sendWith: args.isSendWidth ? args.options.sendWith : [],
  }
  const r: DojoProcessActionSdkResults = await ninja.dojo.processActionSdk(params)
  return r.sendWithResults
}

async function createNewTx(ninja: NinjaBase, args: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameString)
: Promise<PendingSignAction>
{
  const dojoArgs = removeUnlockScripts(args);
  const dcr = await ninja.dojo.createActionUnsigned(dojoArgs, originator)

  const reference = dcr.referenceNumber

  const { tx, amount, pdi } = buildSignableTransaction(dcr, args, ninja.getClientChangeKeyPair())

  const prior: PendingSignAction = { reference, dcr, args, amount, tx, pdi }

  return prior
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
: { tx: Transaction, amount: number, pdi: PendingDojoInput[], log: string }
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

  const pendingDojoInputs: PendingDojoInput[] = []

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

      pendingDojoInputs.push({
        vin: tx.inputs.length,
        derivationPrefix: verifyTruthy(instructions.derivationPrefix),
        derivationSuffix: verifyTruthy(instructions.derivationSuffix),
        unlockerPubKey: verifyTruthy(instructions.senderIdentityKey),
        sourceSatoshis: otr.satoshis!,
        lockingScript: otr.lockingScript!
      })

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
    pdi: pendingDojoInputs,
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

