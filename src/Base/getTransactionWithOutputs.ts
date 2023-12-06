import { NinjaBase } from './NinjaBase'
import {
  NinjaGetTransactionWithOutputsParams,
  NinjaSignCreatedTransactionParams,
  NinjaTransactionWithOutputsResultApi,
  NinjaTxInputsApi,
} from '../Api/NinjaApi'
import { NinjaTxBuilder } from '../NinjaTxBuilder'
import { CwiError, DojoTxInputsApi } from 'cwi-base'
import { ERR_NINJA_INVALID_UNLOCK } from '../ERR_NINJA_errors'

/**
 * Convert NinjaTxInputsApi to DojoTxInputsApi to protect unlocking scripts.
 */
export function convertToDojoTxInputsApi(inputs: Record<string, NinjaTxInputsApi>) : Record<string, DojoTxInputsApi> {
  const dojoInputs: Record<string, DojoTxInputsApi> = Object.fromEntries(Object.entries(inputs).map(([k, v]) => ([k, {
    ...v,
    // Calculate unlockingScriptLength from unlockingScript
    outputsToRedeem: v.outputsToRedeem.map(x => ({
      unlockingScriptLength: x.unlockingScript.length / 2,
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

  const createResult = await ninja.dojo.createTransaction({
    inputs: convertToDojoTxInputsApi(inputs),
    outputs,
    feeModel: feeModel || (feePerKb ? { model: 'sat/kb', value: feePerKb } : undefined),
    labels,
    note,
    recipient,
  })

  let r: NinjaTransactionWithOutputsResultApi
  
  try {
    r = await signCreatedTransaction(ninja, { inputs, note, lockTime, createResult })
  } catch(eu: unknown) {
    const e = CwiError.fromUnknown(eu)
    await ninja.dojo.updateTransactionStatus(createResult.referenceNumber, 'failed')
    if (e.code === 'ERR_NINJA_INVALID_UNLOCK') {
      const ed = eu as ERR_NINJA_INVALID_UNLOCK
      await ninja.dojo.updateOutpointStatus(ed.txid, ed.vout, false)
    }
    throw eu
  }

  return r
}

export async function signCreatedTransaction(ninja: NinjaBase, params: NinjaSignCreatedTransactionParams)
: Promise<NinjaTransactionWithOutputsResultApi>
{
  const { inputs, note, lockTime, createResult } = params

  const { tx, outputMap, amount } = NinjaTxBuilder.buildJsTxFromCreateTransactionResult(ninja, inputs, createResult, lockTime)

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
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
export async function processTransactionWithOutputs (ninja: NinjaBase, params: NinjaGetTransactionWithOutputsParams)
: Promise<NinjaTransactionWithOutputsResultApi>
{
  const cr = await createTransactionWithOutputs(ninja, params)

  const pr = await ninja.processTransaction({
    submittedTransaction: cr.rawTx,
    reference: cr.referenceNumber,
    outputMap: cr.outputMap,
    acceptDelayedBroadcast: params.acceptDelayedBroadcast
  })

  return {
    ...cr,
    mapiResponses: pr.mapiResponses,
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
