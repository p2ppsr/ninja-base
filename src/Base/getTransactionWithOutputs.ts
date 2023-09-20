import { NinjaBase } from './NinjaBase'
import { NinjaGetTxWithOutputsProcessedResultApi, NinjaGetTxWithOutputsResultApi, NinjaTxInputsApi } from '../Api/NinjaApi'
import { NinjaTxBuilder } from '../NinjaTxBuilder'
import { DojoCreateTxOutputApi, DojoTxInputsApi } from 'cwi-base'

/* eslint-disable @typescript-eslint/no-unused-vars */
export async function getTransactionWithOutputs (
  ninja: NinjaBase,
  outputs: DojoCreateTxOutputApi[],
  labels?: string[],
  inputs?: Record<string, NinjaTxInputsApi>,
  note?: string,
  recipient?: string,
  autoProcess?: boolean,
  feePerKb?: number,
  lockTime?: number
): Promise<NinjaGetTxWithOutputsResultApi | NinjaGetTxWithOutputsProcessedResultApi> {
  const dojo = ninja.dojo
  inputs ||= {}

  // Convert NinjaTxInputsApi to DojoTxInputsApi to protect unlocking scripts.
  const dojoInputs: Record<string, DojoTxInputsApi> = Object.fromEntries(Object.entries(inputs).map(([k, v]) => ([k, {
    ...v,
    // Calculate unlockingScriptLength from unlockingScript
    outputsToRedeem: v.outputsToRedeem.map(x => ({
      unlockingScriptLength: x.unlockingScript.length / 2,
      index: x.index,
      sequenceNumber: x.sequenceNumber
    }))
  }])))

  const createResult = await dojo.createTransaction(
    dojoInputs,
    undefined,
    outputs,
    undefined,
    { model: 'sat/kb', value: feePerKb },
    labels,
    note,
    recipient
  )

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

  // Return an SPV Envelope
  if (!autoProcess) {
    return {
      rawTx,
      txid: tx.id,
      referenceNumber,
      amount,
      inputs: sanitizedInputs,
      outputMap
    }
  }

  const r = await ninja.processTransaction({
    submittedTransaction: rawTx,
    reference: referenceNumber,
    outputMap
  })

  return {
    rawTx,
    txid: tx.id,
    mapiResponses: r.mapiResponses,
    note,
    amount,
    inputs: sanitizedInputs
  }
}
