/* eslint-disable @typescript-eslint/no-unused-vars */
import { sdk, WERR_INTERNAL } from "@babbage/sdk-ts";
import { NinjaBase } from "../NinjaBase";
import {
  asBsvSdkScript,
  DojoCreateTransactionSdkInput,
  DojoCreateTransactionSdkOutput,
  DojoCreateTransactionSdkResult,
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
  unlockerPubKey?: string,
  sourceSatoshis: number,
  lockingScript: string
}

export interface PendingSignAction {
  reference: string
  dcr: DojoCreateTransactionSdkResult
  args: sdk.ValidCreateActionArgs
  tx: Transaction
  amount: number
  pdi: PendingDojoInput[]
}

export async function createActionSdk(ninja: NinjaBase, vargs: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
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
    r.noSendChange = prior.dcr.noSendChangeOutputVouts?.map(vout => `${r.txid}.${vout}`)
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

  const txid = prior.tx.id('hex')

  const r: sdk.CreateActionResult = {
    noSendChange: args.isNoSend ? prior.dcr.noSendChangeOutputVouts?.map(vout => `${txid}.${vout}`) : undefined,
    signableTransaction: {
      reference: prior.dcr.referenceNumber,
      tx: makeAtomicBeef(prior.tx, prior.dcr.inputBeef)
    }
  }

  ninja.pendingSignActions[r.signableTransaction!.reference] = prior

  return r
}

export async function processActionSdk(prior: PendingSignAction | undefined, ninja: NinjaBase, args: sdk.ValidProcessActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
: Promise<sdk.SendWithResult[] | undefined>
{
  const params: DojoProcessActionSdkParams = {
    isNewTx: args.isNewTx,
    isSendWith: args.isSendWith,
    isNoSend: args.isNoSend,
    isDelayed: args.isDelayed,
    reference: prior ? prior.reference : undefined,
    txid: prior ? prior.tx.id('hex') : undefined,
    rawTx: prior ? prior.tx.toBinary() : undefined,
    sendWith: args.isSendWith ? args.options.sendWith : [],
  }
  const r: DojoProcessActionSdkResults = await ninja.dojo.processActionSdk(params)

  return r.sendWithResults
}

async function createNewTx(ninja: NinjaBase, args: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
: Promise<PendingSignAction>
{
  const dojoArgs = removeUnlockScripts(args);
  const dcr = await ninja.dojo.createTransactionSdk(dojoArgs, originator)

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
  dctr: DojoCreateTransactionSdkResult,
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

  // The order of outputs in dojoOutputs is always:
  // CreateActionArgs.outputs in the original order
  // Commission output
  // Change outputs
  // The Vout values will be randomized if args.options.randomizeOutputs is true. Default is true.
  const voutToIndex = Array<number>(dojoOutputs.length)
  for (let vout = 0; vout < dojoOutputs.length; vout++) {
    const i = dojoOutputs.findIndex(o => o.vout === vout)
    if (i < 0)
      throw new ERR_INVALID_PARAMETER('output.vout', `sequential. ${vout} is missing`)
    voutToIndex[vout] = i
  }

  //////////////
  // Add OUTPUTS
  /////////////
  for (let vout = 0; vout < dojoOutputs.length; vout++) {
    const i = voutToIndex[vout]
    const out = dojoOutputs[i]
    if (vout !== out.vout)
      throw new ERR_INVALID_PARAMETER('output.vout', `equal to array index. ${out.vout} !== ${vout}`)

    const change = out.providedBy === 'dojo' && out.purpose === 'change'

    const lockingScript = change ? makeChangeLock(out, dctr, args, changeKeys) : asBsvSdkScript(out.lockingScript)

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
    dojoInput: DojoCreateTransactionSdkInput,
  }[] = []
  for (const dojoInput of dojoInputs) {
    const argsInput = (dojoInput.vin !== undefined && dojoInput.vin < args.inputs.length) ? args.inputs[dojoInput.vin] : undefined
    inputs.push({ argsInput, dojoInput })
  }
  inputs.sort((a, b) => a.dojoInput.vin! < b.dojoInput.vin! ? -1 : a.dojoInput.vin! === b.dojoInput.vin! ? 0 : 1)

  const pendingDojoInputs: PendingDojoInput[] = []

  //////////////
  // Add INPUTS
  /////////////
  let totalChangeInputs = 0
  for (const { dojoInput, argsInput } of inputs) {
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
      if (dojoInput.type !== 'P2PKH')
        throw new ERR_INVALID_PARAMETER('type', `vin ${dojoInput.vin}, "${dojoInput.type}" is not a supported unlocking script type.`);

      pendingDojoInputs.push({
        vin: tx.inputs.length,
        derivationPrefix: verifyTruthy(dojoInput.derivationPrefix),
        derivationSuffix: verifyTruthy(dojoInput.derivationSuffix),
        unlockerPubKey: dojoInput.senderIdentityKey,
        sourceSatoshis: dojoInput.sourceSatoshis,
        lockingScript: dojoInput.sourceLockingScript
      })

      const inputToAdd: TransactionInput = {
        sourceTXID: dojoInput.sourceTxid,
        sourceOutputIndex: dojoInput.sourceVout,
        unlockingScript: new Script(),
        sequence: 0xffffffff
      };
      tx.addInput(inputToAdd);
      totalChangeInputs += verifyTruthy(dojoInput.sourceSatoshis);
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
  out: DojoCreateTransactionSdkOutput,
  dctr: DojoCreateTransactionSdkResult,
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

