import { Transaction } from '@bsv/sdk';
import { NinjaApi, NinjaTxInputsApi } from '../Api/NinjaApi';
import { DojoCreateTransactionResultApi } from 'cwi-base';
import { buildTxBsvSdk } from './buildTxBsvSdk';


export async function buildBsvTxFromCreateTransactionResult(
  ninja: NinjaApi,
  inputs: Record<string, NinjaTxInputsApi>,
  createResult: DojoCreateTransactionResultApi
): Promise<{
  tx: Transaction;
  outputMap: Record<string, number>;
  amount: number;
  log?: string;
}> {
  const {
    inputs: txInputs, outputs: txOutputs, derivationPrefix, version, lockTime
  } = createResult;

  const r = await buildTxBsvSdk(ninja, inputs, txInputs, txOutputs, derivationPrefix, version, lockTime, createResult.log);

  return r;
}
