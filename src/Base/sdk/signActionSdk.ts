/* eslint-disable @typescript-eslint/no-unused-vars */
import { Beef, Transaction, TransactionInput } from "@bsv/sdk";
import { sdk } from "@babbage/sdk-ts";
import { NinjaBase } from "../NinjaBase";
import { ValidSignActionArgs, WERR_INTERNAL, WERR_INVALID_PARAMETER, WERR_NOT_IMPLEMENTED } from "@babbage/sdk-ts/src/sdk";
import { asBsvSdkScript, ScriptTemplateSABPPP } from "cwi-base";
import { PendingSignAction, processActionSdk } from "./createActionSdk";

export async function signActionSdk(ninja: NinjaBase, vargs: ValidSignActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
: Promise<sdk.SignActionResult>
{
  const prior = ninja.pendingSignActions[vargs.reference]
  if (!prior)
    throw new WERR_NOT_IMPLEMENTED('recovery of out-of-session signAction reference data is not yet implemented.')
  if (!prior.dcr.inputBeef)
    throw new WERR_INTERNAL('prior.dcr.inputBeef must be valid')

  prior.tx = await completeSignedTransaction(prior, vargs.spends, ninja)

  const sendWithResults = await processActionSdk(prior, ninja, vargs, originator)

  const r: sdk.SignActionResult = {
    txid: prior.tx.id('hex'),
    tx: vargs.options.returnTXIDOnly ? undefined : makeAtomicBeef(prior.tx, prior.dcr.inputBeef),
    sendWithResults
  }

  return r
}

export function makeAtomicBeef(tx: Transaction, beef: number[] | Beef) : number[] {
  if (Array.isArray(beef))
    beef = Beef.fromBinary(beef)
  beef.mergeTransaction(tx)
  return beef.toBinaryAtomic(tx.id('hex'))
}

export async function completeSignedTransaction(
  prior: PendingSignAction,
  spends: Record<number, sdk.SignActionSpend>,
  ninja: NinjaBase,
)
: Promise<Transaction>
{

  /////////////////////
  // Insert the user provided unlocking scripts from "spends" arg
  /////////////////////
  for (const [key, spend] of Object.entries(spends)) {
    const vin = Number(key)
    const createInput = prior.args.inputs[vin]
    const input = prior.tx.inputs[vin]
    if (!createInput || !input || createInput.unlockingScript || !Number.isInteger(createInput.unlockingScriptLength))
      throw new WERR_INVALID_PARAMETER('args', `spend does not correspond to prior input with valid unlockingScriptLength.`)
    if (spend.unlockingScript.length / 2 > createInput.unlockingScriptLength!)
      throw new WERR_INVALID_PARAMETER('args', `spend unlockingScript length ${spend.unlockingScript.length} exceeds expected length ${createInput.unlockingScriptLength}`)
    input.unlockingScript = asBsvSdkScript(spend.unlockingScript)
    if (spend.sequenceNumber !== undefined)
      input.sequence = spend.sequenceNumber
  }

  const results = {
    sdk: <sdk.SignActionResult>{}
  }

  /////////////////////
  // Insert SABPPP unlock templates for dojo signed inputs
  /////////////////////
  for (const pdi of prior.pdi) {
    const sabppp = new ScriptTemplateSABPPP({
      derivationPrefix: pdi.derivationPrefix,
      derivationSuffix: pdi.derivationSuffix
    })
    const keys = ninja.getClientChangeKeyPair()
    const lockerPrivKey = keys.privateKey
    const unlockerPubKey = pdi.unlockerPubKey || keys.publicKey
    const sourceSatoshis = pdi.sourceSatoshis
    const lockingScript = asBsvSdkScript(pdi.lockingScript)
    const unlockTemplate = sabppp.unlock(lockerPrivKey, unlockerPubKey, sourceSatoshis, lockingScript)
    const input = prior.tx.inputs[pdi.vin]
    input.unlockingScriptTemplate = unlockTemplate
  }

  /////////////////////
  // Sign dojo signed inputs making transaction fully valid.
  /////////////////////
  await prior.tx.sign()
  
  return prior.tx
}
