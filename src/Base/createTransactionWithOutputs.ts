import { NinjaBase } from './NinjaBase';
import {
  NinjaGetTransactionWithOutputsParams,
  NinjaTransactionWithOutputsResultApi,
  NinjaTxInputsApi
} from '../Api/NinjaApi';
import { DojoCreateTransactionParams, DojoTxInputsApi, stampLog, validateInputSelection } from 'cwi-base';
import { signCreatedTransaction } from './signCreatedTransaction';
import { unpackFromCreateTransactionResult } from './unpackFromCreateTransactionResult';
import { validateDefaultParams } from './processTransactionWithOutputs';

export async function createTransactionWithOutputs(ninja: NinjaBase, params: NinjaGetTransactionWithOutputsParams)
: Promise<NinjaTransactionWithOutputsResultApi> {

  validateDefaultParams(params, 'start ninja createTransactionWithOutputs')

  let {
    inputs,
    options,
    log
  } = params;

  inputs ||= {};
  options ||= {};

  const isSendWidth = options.sendWith && options.sendWith.length > 0
  const withoutNewTx = (isSendWidth && (!params.inputs || Object.keys(params.inputs).length < 1) && (!params.outputs || params.outputs.length < 1))
  if (withoutNewTx) {
    log = stampLog(log, `... ninja createTransactionWithOutputs sendWith without inputs or outputs`)
    log = stampLog(log, `end ninja createTransactionWithOutputs`) 
    const r: NinjaTransactionWithOutputsResultApi = {
      amount: 0,
      inputs: {},
      referenceNumber: '',
      options,
      log
    }
    return r
  }

  const {
    outputs,
    labels,
    note,
    recipient,
    feePerKb,
    feeModel,
    lockTime,
    version
  } = params;

  const params2: DojoCreateTransactionParams = {
    inputs: convertToDojoTxInputsApi(inputs),
    beef: params.beef,
    outputs: outputs || [],
    feeModel: feeModel || (feePerKb ? { model: 'sat/kb', value: feePerKb } : undefined),
    version,
    lockTime,
    labels,
    note,
    recipient,
    options,
    log
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const signActionRequired = needsSignAction(inputs);

  if (options.acceptDelayedBroadcast) {
    // Create inputSelection with default properties
    params2.inputSelection = validateInputSelection(undefined);
    // Include transaction outputs from transactions still waiting to be sent.
    params2.inputSelection.includeSending = true;
  }

  ///////////////
  // Dojo creates the transaction structure (all inputs in order, all outputs in order, fee to be paid).
  //////////////

  const createResult = await ninja.dojo.createTransaction(params2);
  log = createResult.log

  let r: NinjaTransactionWithOutputsResultApi;

  if (signActionRequired) {
    const unpacked = unpackFromCreateTransactionResult(inputs, createResult)
    log = stampLog(log, "end ninja createTransactionWithOutputs signActionRequired true");
    r = {
      signActionRequired,
      createResult,
      ...unpacked,
      note,
      options,
      log
    }
    return r
  }

  log = stampLog(log, '... ninja createTransactionWithOutputs signing transaction');

  /////////////
  // Ninja creates BSV signed transaction (unless some unlockingScripts specified by length only)
  ////////////

  createResult.log = log
  r = await signCreatedTransaction(ninja, { inputs, createResult });
  r.log = stampLog(r.log, "end ninja createTransactionWithOutputs");

  return r;
}

export function getUnlockingScriptLength(script: string | number) : number {
  return typeof script === 'string' ? script.length / 2 : script
}

/**
 * @returns true if at least one unlockingScript is specified only as a maximum length number.
 */
export function needsSignAction(inputs: Record<string, NinjaTxInputsApi>) {
  return Object.values(inputs).some(i => i.outputsToRedeem.some(otr => typeof otr.unlockingScript !== 'string'))
}

/**
 * Convert NinjaTxInputsApi to DojoTxInputsApi to protect unlocking scripts.
 */
export function convertToDojoTxInputsApi(inputs: Record<string, NinjaTxInputsApi>) : Record<string, DojoTxInputsApi> {
  const dojoInputs: Record<string, DojoTxInputsApi> = Object.fromEntries(Object.entries(inputs).map(([k, v]) => ([k, {
    ...v,
    // Calculate unlockingScriptLength from unlockingScript
    outputsToRedeem: v.outputsToRedeem.map(x => ({
      unlockingScriptLength: getUnlockingScriptLength(x.unlockingScript),
      index: x.index,
      sequenceNumber: x.sequenceNumber
    }))
  }])))
  return dojoInputs
}