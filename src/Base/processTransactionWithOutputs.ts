import { NinjaBase } from './NinjaBase';
import {
  NinjaGetTransactionWithOutputsParams,
  NinjaTransactionWithOutputsResultApi
} from '../Api/NinjaApi';
import { stampLog, verifyTruthy } from 'cwi-base';
import { createTransactionWithOutputs } from './createTransactionWithOutputs';

export async function processTransactionWithOutputs(ninja: NinjaBase, params: NinjaGetTransactionWithOutputsParams): Promise<NinjaTransactionWithOutputsResultApi> {

  params.log = stampLog(params.log, "start ninja processTransactionWithOutputs");

  const cr = await createTransactionWithOutputs(ninja, params);

  const pr = await ninja.processTransaction({
    submittedTransaction: verifyTruthy(cr.rawTx),
    reference: cr.referenceNumber,
    outputMap: verifyTruthy(cr.outputMap),
    acceptDelayedBroadcast: params.acceptDelayedBroadcast,
    trustSelf: params.trustSelf,
    log: cr.log
  });

  const r: NinjaTransactionWithOutputsResultApi = {
    ...cr,
    mapiResponses: pr.mapiResponses,
    log: stampLog(pr.log, "end ninja processTransactionWithOutputs")
  };

  if (params.trustSelf === 'known' && !r.signActionRequired && r.txid) {
    // In trustSelf 'known' mode, only the new txid needs to go back to the user.
    r.rawTx = undefined
    r.mapiResponses = undefined
    r.inputs = {}
  }

  return r
}
