import { NinjaBase } from './NinjaBase';
import {
  NinjaGetTransactionWithOutputsParams,
  NinjaTransactionWithOutputsResultApi
} from '../Api/NinjaApi';
import { stampLog } from 'cwi-base';
import { createTransactionWithOutputs } from './createTransactionWithOutputs';

export async function processTransactionWithOutputs(ninja: NinjaBase, params: NinjaGetTransactionWithOutputsParams): Promise<NinjaTransactionWithOutputsResultApi> {

  params.log = stampLog(params.log, "start ninja processTransactionWithOutputs");

  const cr = await createTransactionWithOutputs(ninja, params);

  const pr = await ninja.processTransaction({
    submittedTransaction: cr.rawTx,
    reference: cr.referenceNumber,
    outputMap: cr.outputMap,
    acceptDelayedBroadcast: params.acceptDelayedBroadcast,
    log: cr.log
  });

  return {
    ...cr,
    mapiResponses: pr.mapiResponses,
    log: stampLog(pr.log, "end ninja processTransactionWithOutputs")
  };
}
