/* eslint-disable @typescript-eslint/no-unused-vars */
import { NinjaBase } from './NinjaBase'
import {
  NinjaSignActionParams,
  NinjaSignActionResultApi,
} from '../Api/NinjaApi'
import { ERR_NOT_IMPLEMENTED,  asBsvSdkTx, stampLog, verifyOne, verifyTruthy } from 'cwi-base'

export async function signAction(ninja: NinjaBase, params: NinjaSignActionParams)
: Promise<NinjaSignActionResultApi>
{
  throw new ERR_NOT_IMPLEMENTED()

  const {
    createTransactionResult: ctr,
    rawTx,
    acceptDelayedBroadcast
  } = params

  const log = stampLog('', "start ninja signAction")

  const changeKeys = ninja.getClientChangeKeyPair()

  const dbTx = verifyOne((await ninja.dojo.getTransactions({
      referenceNumber: ctr.referenceNumber,
      status: 'unsigned',
      addLabels: true,
      addInputsAndOutputs: true,
      includeBasket: true,
      includeTags: true
    })).txs)
  
  const bsvTx = asBsvSdkTx(rawTx)
  
  for (let vin = 0; vin < bsvTx.inputs.length; vin++) {
    const i = bsvTx.inputs[vin]
    const txid = verifyTruthy(i.sourceTXID)
    if (txid in ctr.inputs && i.sourceOutputIndex in ctr.inputs[txid].instructions) {
      const instructions = ctr.inputs[txid].instructions[i.sourceOutputIndex]
      if (instructions.type === 'P2PKH') {
        //i.unlockingScriptTemplate = new NinjaUnlockTemplateSABPPP(instructions, changeKeys)
      }
    }
  }

  await bsvTx.sign()
/*
  const createResult = await ninja.dojo.createTransaction(params2)

  log = stampLog(log, "end ninja createTransactionWithOutputs")
  if (typeof params.log === 'string')
    log = params.log + log
  else {
    console.log(stampLogFormat(log))
  }

  const r : NinjaSignActionResultApi = {
    referenceNumber: ctr.referenceNumber,
    txid: bsvTx,
    rawTx: '',
    mapiResponses: [],
    log: undefined
  }

  return r
*/
}