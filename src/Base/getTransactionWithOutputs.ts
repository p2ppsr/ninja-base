import { NinjaBase } from './NinjaBase'
import {
  NinjaGetTransactionWithOutputsParams,
  NinjaTransactionWithOutputsResultApi,
} from '../Api/NinjaApi'
import { createTransactionWithOutputs } from './createTransactionWithOutputs'
import { processTransactionWithOutputs, validateDefaultParams } from './processTransactionWithOutputs'
import { ERR_INVALID_PARAMETER, stampLog } from 'cwi-base'

export async function getTransactionWithOutputs (ninja: NinjaBase, params: NinjaGetTransactionWithOutputsParams)
: Promise<NinjaTransactionWithOutputsResultApi>
{
  let r: NinjaTransactionWithOutputsResultApi

  validateDefaultParams(params, 'start ninja getTransactionWithOutputs')

  if (params.autoProcess === false)
    // Only create the transaction, use ninja.processTransaction to submit the created transaction for processing.
    r = await createTransactionWithOutputs(ninja, params)
  else
    // Create the transaction and forward to ninja.processTransaction to submit the created transaction for processing.
    r = await processTransactionWithOutputs(ninja, params)

  // Return the results requested by resultFormat
  switch (params.options?.resultFormat) {
    case undefined:
      delete r.beef
      break
    case 'beef':
      delete r.rawTx
      r.inputs = {}
      break
    case 'none':
      delete r.beef
      delete r.rawTx
      r.inputs = {}
      break
    default:
      throw new ERR_INVALID_PARAMETER('resultFormat', `'beef', 'none', or undefined`)
  }

  r.log = stampLog(r.log, `end ninja getTransactionWithOutputs`);

  return r
}
