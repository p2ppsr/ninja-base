import { NinjaBase } from './NinjaBase';
import {
  NinjaSignCreatedTransactionParams,
  NinjaTransactionWithOutputsResultApi} from '../Api/NinjaApi';
import {
  ERR_INTERNAL, ERR_INVALID_PARAMETER} from 'cwi-base';
import { NinjaTxBuilder } from '../NinjaTxBuilder';
import { buildBsvTxFromCreateTransactionResult } from './buildBsvTxFromCreateTransactionResult';


export async function signCreatedTransaction(ninja: NinjaBase, params: NinjaSignCreatedTransactionParams)
: Promise<NinjaTransactionWithOutputsResultApi>
{
  const { inputs, note, createResult } = params;

  if (createResult.paymailHandle)
    throw new ERR_INVALID_PARAMETER('paymailHandle', 'undefined. It has be fully deprecated.')

  ///////////////
  // Begin Temporary code to confirm @bsv/sdk based transaction creation and signing...
  const r2 = NinjaTxBuilder.buildJsTxFromCreateTransactionResult(ninja, inputs, createResult)

  const rawTx2 = r2.tx.uncheckedSerialize()
  const txid2 = r2.tx.id
  // End Temporary code
  //////////////////////

  const { tx, outputMap, amount, log } = await buildBsvTxFromCreateTransactionResult(ninja, inputs, createResult);

  const rawTx = tx.toHex();
  const txid = tx.id("hex") as string;

  ///////////////
  // Begin Temporary code to confirm @bsv/sdk based transaction creation and signing...
  if (rawTx !== rawTx2 || txid !== txid2) {
    debugger
    throw new ERR_INTERNAL()
  }
  // End Temporary code
  //////////////////////

  const { inputs: txInputs, referenceNumber } = createResult;

  // The inputs are sanitized to remove non-envelope properties (instructions, outputsToRedeem, ...)
  const sanitizedInputs = Object.fromEntries(
    Object.entries(txInputs).map(([k, v]) => ([k, {
      inputs: v.inputs,
      mapiResponses: v.mapiResponses,
      proof: v.proof,
      rawTx: v.rawTx
    }]))
  );

  return {
    rawTx,
    txid,
    amount,
    inputs: sanitizedInputs,
    note,
    referenceNumber,
    outputMap,
    log
  };
}


