import { NinjaBase } from './NinjaBase'
import {
  NinjaGetTransactionWithOutputsParams,
  NinjaSignActionParams,
  NinjaSignActionResultApi,
  NinjaSignCreatedTransactionParams,
  NinjaTransactionWithOutputsResultApi,
} from '../Api/NinjaApi'
import { NinjaTxBuilder } from '../NinjaTxBuilder'
import { CwiError,  asBsvSdkTx, stampLog, stampLogFormat, validateInputSelection, verifyOne } from 'cwi-base'
import { ERR_NINJA_INVALID_UNLOCK } from '../ERR_NINJA_errors'

export async function signAction(ninja: NinjaBase, params: NinjaSignActionParams)
: Promise<NinjaSignActionResultApi>
{
  const {
    referenceNumber,
    rawTx,
    acceptDelayedBroadcast
  } = params

  let log = stampLog('', "start ninja signAction")

  const dbTx = verifyOne((await ninja.dojo.getTransactions({
      referenceNumber,
      status: 'unsigned',
      addLabels: true,
      addInputsAndOutputs: true,
      includeBasket: true,
      includeTags: true
    })).txs)
  
  const bsvTx = asBsvSdkTx(rawTx)
  
  for (let vin = 0; vin < bsvTx.inputs.length; vin++) {

  }

  await bsvTx.sign()
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
