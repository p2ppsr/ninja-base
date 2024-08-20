import { NinjaBase } from './NinjaBase';
import {
  NinjaSignCreatedTransactionParams,
  NinjaTransactionWithOutputsResultApi} from '../Api/NinjaApi';
import {
  ERR_INVALID_PARAMETER,
  verifyTruthy} from 'cwi-base';
import { buildBsvTxFromCreateTransactionResult } from './buildBsvTxFromCreateTransactionResult';
import { needsSignAction } from './createTransactionWithOutputs';


export async function signCreatedTransaction(ninja: NinjaBase, params: NinjaSignCreatedTransactionParams)
: Promise<NinjaTransactionWithOutputsResultApi>
{
  const { inputs, createResult } = params;

  if (needsSignAction(inputs))
    throw new ERR_INVALID_PARAMETER('inputs', 'complete unlockingScript values.')

  if (createResult.paymailHandle)
    throw new ERR_INVALID_PARAMETER('paymailHandle', 'undefined. It has be fully deprecated.')

  const changeKeys = ninja.getClientChangeKeyPair();

  const { tx, outputMap, amount, log } = await buildBsvTxFromCreateTransactionResult(inputs, createResult, changeKeys);

  const { inputs: txInputs, referenceNumber } = createResult;

  const rawTx = tx.toHex();
  const txid = tx.id("hex") as string;

  // The inputs are sanitized to remove non-envelope properties (instructions, outputsToRedeem, ...)
  const sanitizedInputs = Object.fromEntries(
    Object.entries(txInputs).map(([k, v]) => ([k, {
      inputs: v.inputs,
      mapiResponses: v.mapiResponses,
      proof: v.proof,
      rawTx: verifyTruthy(v.rawTx)
    }]))
  );

  return {
    rawTx,
    txid,
    amount,
    inputs: sanitizedInputs,
    note: createResult.note,
    referenceNumber,
    outputMap,
    options: createResult.options,
    log
  };
}


