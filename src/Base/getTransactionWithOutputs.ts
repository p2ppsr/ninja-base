import { NinjaBase } from './NinjaBase'
import {
  NinjaGetTransactionWithOutputsParams,
  NinjaTransactionWithOutputsResultApi,
} from '../Api/NinjaApi'
import { createTransactionWithOutputs } from './createTransactionWithOutputs'
import { processTransactionWithOutputs, validateDefaultParams } from './processTransactionWithOutputs'
import { stampLog } from 'cwi-base'

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

  r.log = stampLog(r.log, `end ninja getTransactionWithOutputs`);

  return r
}
