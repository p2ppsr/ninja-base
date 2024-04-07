import { NinjaBase } from './NinjaBase'
import {
  NinjaGetTransactionWithOutputsParams,
  NinjaTransactionWithOutputsResultApi,
} from '../Api/NinjaApi'
import { createTransactionWithOutputs } from './createTransactionWithOutputs'
import { processTransactionWithOutputs } from './processTransactionWithOutputs'

export async function getTransactionWithOutputs (ninja: NinjaBase, params: NinjaGetTransactionWithOutputsParams)
: Promise<NinjaTransactionWithOutputsResultApi>
{
  let r: NinjaTransactionWithOutputsResultApi

  if (params.autoProcess === false)
    // Only create the transaction, use ninja.processTransaction to submit the created transaction for processing.
    r = await createTransactionWithOutputs(ninja, params)
  else
    // Create the transaction and forward to ninja.processTransaction to submit the created transaction for processing.
    r = await processTransactionWithOutputs(ninja, params)

  return r
}
