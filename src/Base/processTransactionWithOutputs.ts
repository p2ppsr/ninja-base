import { NinjaBase } from './NinjaBase';
import {
  NinjaGetTransactionWithOutputsParams,
  NinjaTransactionWithOutputsResultApi
} from '../Api/NinjaApi';
import { stampLog, verifyTruthy } from 'cwi-base';
import { createTransactionWithOutputs } from './createTransactionWithOutputs';

export async function processTransactionWithOutputs(ninja: NinjaBase, params: NinjaGetTransactionWithOutputsParams): Promise<NinjaTransactionWithOutputsResultApi> {

  validateDefaultParams(params, 'start ninja processTransactionWithOutputs')

  const options = verifyTruthy(params.options)

  const cr = await createTransactionWithOutputs(ninja, params);

  const pr = await ninja.processTransaction({
    beef: cr.beef,
    submittedTransaction: cr.rawTx,
    reference: cr.referenceNumber,
    outputMap: cr.outputMap,
    options,
    log: cr.log
  });

  const r: NinjaTransactionWithOutputsResultApi = {
    ...cr,
    mapiResponses: pr.mapiResponses,
    log: stampLog(pr.log, "end ninja processTransactionWithOutputs")
  };

  if (options.trustSelf === 'known' && !r.signActionRequired && r.txid) {
    // In trustSelf 'known' mode, only the new txid needs to go back to the user.
    r.rawTx = undefined
    r.mapiResponses = undefined
    r.inputs = {}
  }

  return r
}

export function validateDefaultParams(params: NinjaGetTransactionWithOutputsParams, logLabel?: string) {
  params.autoProcess = params.autoProcess === undefined ? true : params.autoProcess
  params.options ||= {}
  if (params.acceptDelayedBroadcast !== undefined) params.options.acceptDelayedBroadcast = params.acceptDelayedBroadcast
  if (params.options.acceptDelayedBroadcast === undefined) params.options.acceptDelayedBroadcast = true

  if (logLabel)
    params.log = stampLog(params.log, `${logLabel} autoProcess=${params.autoProcess} acceptDelayedBroadcast=${params.options.acceptDelayedBroadcast} trustSelf=${params.options.trustSelf}`);
}

