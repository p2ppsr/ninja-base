import { NinjaBase } from './NinjaBase';
import {
  NinjaSignCreatedTransactionParams,
  NinjaTransactionWithOutputsResultApi} from '../Api/NinjaApi';
import {
  ERR_INVALID_PARAMETER,
  verifyTruthy} from 'cwi-base';
import { buildBsvTxFromCreateTransactionResult } from './buildBsvTxFromCreateTransactionResult';
import { needsSignAction } from './createTransactionWithOutputs';
import { Beef } from '@babbage/sdk-ts';


export async function signCreatedTransaction(ninja: NinjaBase, params: NinjaSignCreatedTransactionParams)
: Promise<NinjaTransactionWithOutputsResultApi>
{
  const { inputs: ninjaInputs, createResult } = params;
  const { inputs, inputBeef, referenceNumber } = createResult;
  const options = createResult.options || {}

  if (needsSignAction(ninjaInputs))
    throw new ERR_INVALID_PARAMETER('inputs', 'complete unlockingScript values.')

  if (createResult.paymailHandle)
    throw new ERR_INVALID_PARAMETER('paymailHandle', 'undefined. It has be fully deprecated.')

  const changeKeys = ninja.getClientChangeKeyPair();

  const { tx, outputMap, amount, log } = await buildBsvTxFromCreateTransactionResult(ninjaInputs, createResult, changeKeys);

  const txid = tx.id("hex") as string;

  const r: NinjaTransactionWithOutputsResultApi = {
    txid,
    amount,
    referenceNumber,
    options,
    outputMap,
    note: createResult.note,
    log,

    beef: undefined,
    rawTx: undefined,
    inputs: {},
  }

  if (inputBeef) {
    // Add the new signed transaction to the BEEF
    const beef = Beef.fromBinary(inputBeef)
    beef.mergeTransaction(tx)
    r.beef = beef.toBinary()
  } else {

    r.rawTx = tx.toHex();

    // The inputs are sanitized to remove non-envelope properties (instructions, outputsToRedeem, ...)
    const sanitizedInputs = Object.fromEntries(
      Object.entries(inputs).map(([k, v]) => ([k, {
        inputs: v.inputs,
        mapiResponses: v.mapiResponses,
        proof: v.proof,
        rawTx: verifyTruthy(v.rawTx)
      }]))
    );

    r.inputs = sanitizedInputs

  }

  return r
}


