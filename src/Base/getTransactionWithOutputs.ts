import { NinjaBase } from './NinjaBase'
import {
  NinjaGetTransactionWithOutputsParams,
  NinjaSignCreatedTransactionParams,
  NinjaTransactionWithOutputsResultApi,
  NinjaTxInputsApi,
} from '../Api/NinjaApi'
import { NinjaTxBuilder } from '../NinjaTxBuilder'
import { CwiError, DojoCreateTransactionParams, DojoTxInputsApi, stampLog, stampLogFormat, validateInputSelection } from 'cwi-base'
import { ERR_NINJA_INVALID_UNLOCK } from '../ERR_NINJA_errors'

export function getUnlockingScriptLength(script: string | number) : number {
  return typeof script === 'string' ? script.length / 2 : script
}

/**
 * @returns true if at least one unlockingScript is specified only as a maximum length number.
 */
export function needsSignAction(inputs: Record<string, NinjaTxInputsApi>) {
  return Object.values(inputs).some(i => i.outputsToRedeem.some(otr => typeof otr.unlockingScript !== 'string'))
}

/**
 * Convert NinjaTxInputsApi to DojoTxInputsApi to protect unlocking scripts.
 */
export function convertToDojoTxInputsApi(inputs: Record<string, NinjaTxInputsApi>) : Record<string, DojoTxInputsApi> {
  const dojoInputs: Record<string, DojoTxInputsApi> = Object.fromEntries(Object.entries(inputs).map(([k, v]) => ([k, {
    ...v,
    // Calculate unlockingScriptLength from unlockingScript
    outputsToRedeem: v.outputsToRedeem.map(x => ({
      unlockingScriptLength: getUnlockingScriptLength(x.unlockingScript),
      index: x.index,
      sequenceNumber: x.sequenceNumber
    }))
  }])))
  return dojoInputs
}

export async function createTransactionWithOutputs (ninja: NinjaBase, params: NinjaGetTransactionWithOutputsParams)
: Promise<NinjaTransactionWithOutputsResultApi>
{
  const {
    outputs,
    labels,
    note,
    recipient,
    feePerKb,
    feeModel,
    lockTime,
  } = params
  let {
    inputs
  } = params

  inputs ||= {}

  let log = stampLog('', "start ninja createTransactionWithOutputs")

  const params2: DojoCreateTransactionParams = {
    inputs: convertToDojoTxInputsApi(inputs),
    outputs,
    feeModel: feeModel || (feePerKb ? { model: 'sat/kb', value: feePerKb } : undefined),
    labels,
    note,
    recipient,
    log
  }

  const signActionRequired = needsSignAction(inputs)

  if (params.acceptDelayedBroadcast) {
    // Create inputSelection with default properties
    params2.inputSelection = validateInputSelection(undefined)
    // Include transaction outputs from transactions still waiting to be sent.
    params2.inputSelection.includeSending = true
  }
  const createResult = await ninja.dojo.createTransaction(params2)

  log = stampLog(createResult.log, '... ninja createTransactionWithOutputs signing transaction')

  let r: NinjaTransactionWithOutputsResultApi

  try {
    createResult.log = log
    r = await signCreatedTransaction(ninja, { inputs, note, lockTime, createResult })
    log = stampLog(r.log, '... ninja createTransactionWithOutputs signing transaction')
  } catch(eu: unknown) {
    const e = CwiError.fromUnknown(eu)
    await ninja.dojo.updateTransactionStatus(createResult.referenceNumber, 'failed')
    if (e.code === 'ERR_NINJA_INVALID_UNLOCK') {
      const ed = eu as ERR_NINJA_INVALID_UNLOCK
      await ninja.dojo.updateOutpointStatus(ed.txid, ed.vout, false)
    }
    throw eu
  }

  log = stampLog(r.log, "end ninja createTransactionWithOutputs")
  if (typeof params.log === 'string')
    r.log = params.log + log
  else {
    r.log = log
    console.log(stampLogFormat(log))
  }

  return r
}

export async function signCreatedTransaction(ninja: NinjaBase, params: NinjaSignCreatedTransactionParams)
: Promise<NinjaTransactionWithOutputsResultApi>
{
  const { inputs, note, lockTime, createResult } = params

  const { tx, outputMap, amount, log } = NinjaTxBuilder.buildJsTxFromCreateTransactionResult(ninja, inputs, createResult, lockTime)

  const { inputs: txInputs, referenceNumber } = createResult

  // The inputs are sanitized to remove non-envelope properties (instructions, outputsToRedeem, ...)
  const sanitizedInputs = Object.fromEntries(
    Object.entries(txInputs).map(([k, v]) => ([k, {
      inputs: v.inputs,
      mapiResponses: v.mapiResponses,
      proof: v.proof,
      rawTx: v.rawTx
    }]))
  )

  const rawTx = tx.uncheckedSerialize()

  return {
    rawTx,
    txid: tx.id,
    amount,
    inputs: sanitizedInputs,
    note,
    referenceNumber,
    outputMap,
    log
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
export async function processTransactionWithOutputs (ninja: NinjaBase, params: NinjaGetTransactionWithOutputsParams)
: Promise<NinjaTransactionWithOutputsResultApi>
{
  params.log = stampLog(params.log, "start ninja processTransactionWithOutputs")

  const cr = await createTransactionWithOutputs(ninja, params)

  const pr = await ninja.processTransaction({
    submittedTransaction: cr.rawTx,
    reference: cr.referenceNumber,
    outputMap: cr.outputMap,
    acceptDelayedBroadcast: params.acceptDelayedBroadcast,
    log: cr.log
  })

  return {
    ...cr,
    mapiResponses: pr.mapiResponses,
    log: stampLog(pr.log, "end ninja processTransactionWithOutputs")
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
export async function getTransactionWithOutputs (ninja: NinjaBase, params: NinjaGetTransactionWithOutputsParams)
: Promise<NinjaTransactionWithOutputsResultApi>
{
  if (params.autoProcess === false)
    return await createTransactionWithOutputs(ninja, params)

  return await processTransactionWithOutputs(ninja, params)
}
