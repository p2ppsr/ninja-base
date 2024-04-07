import { NinjaBase } from './NinjaBase';
import {
  NinjaGetTransactionWithOutputsParams,
  NinjaTransactionWithOutputsResultApi,
  NinjaTxInputsApi
} from '../Api/NinjaApi';
import { CwiError, DojoCreateTransactionParams, DojoTxInputsApi, stampLog, stampLogFormat, validateInputSelection } from 'cwi-base';
import { ERR_NINJA_INVALID_UNLOCK } from '../ERR_NINJA_errors';
import { signCreatedTransaction } from './signCreatedTransaction';


export async function createTransactionWithOutputs(ninja: NinjaBase, params: NinjaGetTransactionWithOutputsParams): Promise<NinjaTransactionWithOutputsResultApi> {
  const {
    outputs, labels, note, recipient, feePerKb, feeModel, lockTime, version
  } = params;
  let {
    inputs
  } = params;

  inputs ||= {};

  let log = stampLog('', "start ninja createTransactionWithOutputs");

  const params2: DojoCreateTransactionParams = {
    inputs: convertToDojoTxInputsApi(inputs),
    outputs,
    feeModel: feeModel || (feePerKb ? { model: 'sat/kb', value: feePerKb } : undefined),
    version,
    lockTime,
    labels,
    note,
    recipient,
    log
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const signActionRequired = needsSignAction(inputs);

  if (params.acceptDelayedBroadcast) {
    // Create inputSelection with default properties
    params2.inputSelection = validateInputSelection(undefined);
    // Include transaction outputs from transactions still waiting to be sent.
    params2.inputSelection.includeSending = true;
  }

  ///////////////
  // Dojo creates the transaction structure (all inputs in order, all outputs in order, fee to be paid).
  //////////////

  const createResult = await ninja.dojo.createTransaction(params2);

  log = stampLog(createResult.log, '... ninja createTransactionWithOutputs signing transaction');

  let r: NinjaTransactionWithOutputsResultApi;

  try {

    createResult.log = log;

    /////////////
    // Ninja creates BSV signed transaction (unless some unlockingScripts specified by length only)
    ////////////
    r = await signCreatedTransaction(ninja, { inputs, note, createResult });

    log = stampLog(r.log, '... ninja createTransactionWithOutputs signing transaction');

  } catch (eu: unknown) {
    const e = CwiError.fromUnknown(eu);
    // knex access in catch block hangs on sqlite...
    if (false) {
      try {
        await ninja.dojo.updateTransactionStatus(createResult.referenceNumber, 'failed');
        if (e.code === 'ERR_NINJA_INVALID_UNLOCK') {
          const ed = eu as ERR_NINJA_INVALID_UNLOCK;
          await ninja.dojo.updateOutpointStatus(ed.txid, ed.vout, false);
        }
      } catch { /* */ }
    }
    throw eu;
  }

  log = stampLog(r.log, "end ninja createTransactionWithOutputs");
  if (typeof params.log === 'string')
    r.log = params.log + log;
  else {
    r.log = log;
    console.log(stampLogFormat(log));
  }

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
