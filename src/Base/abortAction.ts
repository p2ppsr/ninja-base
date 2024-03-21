import { NinjaBase } from './NinjaBase'
import {
  NinjaAbortActionParams,
  NinjaAbortActionResultApi,
} from '../Api/NinjaApi'
import { stampLog, stampLogFormat } from 'cwi-base'

export async function abortAction(ninja: NinjaBase, params: NinjaAbortActionParams)
: Promise<NinjaAbortActionResultApi>
{
  const {
    referenceNumber,
  } = params

  let log = stampLog('', "start ninja abortAction")

  await ninja.updateTransactionStatus({ reference: referenceNumber, status: 'failed' })

  log = stampLog(log, "end ninja abortAction")

  if (typeof params.log === 'string')
    log = params.log + log
  else {
    console.log(stampLogFormat(log))
  }

  return { referenceNumber, log }
}