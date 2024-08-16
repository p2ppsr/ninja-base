import { DojoCreateTransactionResultApi, DojoCreateTxOutputApi, EnvelopeEvidenceApi, MapiResponseApi } from "cwi-base";
import { NinjaTransactionWithOutputsResultApi, NinjaTxInputsApi } from "./NinjaApi";

/**
 * Starting point for cwi-core's typescript api.
 * 
 * Supports design and testing.
 */
export interface CwiCoreApi {

    createAction(params: CreateActionParams) : Promise<CreateActionResult>
    //signAction(params: SignActionParams) : Promise<SignActionResult>

}

export interface CreateActionParams {
    /**
     * Human readable string giving the purpose of this transaction.
     * Value will be encrypted prior to leaving this device.
     * Encrypted length limit is 500 characters.
     */
    description: string;
    /**
     * each input's outputsToRedeem:
     *   - satoshis must be greater than zero, must match output's value.
     *   - spendingDescription length limit is 50, values are encrypted before leaving this device
     *   - unlockingScript is max byte length for `signActionRequired` mode, otherwise hex string.
     */
    inputs: Record<string, NinjaTxInputsApi>;
    /**
     * each output:
     *   - description length limit is 50, values are encrypted before leaving this device
     */
    outputs: DojoCreateTxOutputApi[];
    /**
     * Optional. Default is zero.
     * When the transaction can be processed into a block:
     * >= 500,000,000 values are interpreted as minimum required unix time stamps in seconds
     * < 500,000,000 values are interpreted as minimum required block height
     */
    lockTime?: number;
    /**
     * Optional. Transaction version number, default is current standard transaction version value.
     */
    version?: number;
    /**
     * transaction labels to apply to this transaction
     * default []
     */
    labels?: string[];
    /**
     * Reserved Admin originators
     *   'projectbabbage.com'
     *   'staging-satoshiframe.babbage.systems'
     *   'satoshiframe.babbage.systems'
     */
    originator?: string;
    /**
     * true if local validation and self-signed mapi response is sufficient.
     * Upon return, transaction will have `sending` status. Watchman will proceed to send the transaction asynchronously.
     *
     * false if a valid mapi response from the bitcoin transaction processing network is required.
     * Upon return, transaction will have `unproven` status. Watchman will proceed to prove transaction.
     *
     * default true
     */
    acceptDelayedBroadcast?: boolean;
    /**
     * Optional operational and performance logging prior data.
     */
    log?: string;
}

export interface CreateActionResult {
    /**
     * true if at least one input's outputsToRedeem uses numeric max script byte length for unlockingScript
     * 
     * If true, in-process transaction will have status `unsigned`. An `unsigned` transaction must be completed
     * by signing all remaining unsigned inputs and calling `signAction`. Failure to complete the process in
     * a timely manner will cause the transaction to transition to `failed`.
     * 
     * If false or undefined, completed transaction will have status of `sending`, `nosend` or `unproven`,
     * depending on `acceptDelayedBroadcast` and `noBroadcast`.   
     */
    signActionRequired?: boolean
    /**
     * if signActionRequired, the dojo createTransaction results to be forwarded to signAction
     */
    createResult?: DojoCreateTransactionResultApi
    /**
     * if not signActionRequired, signed transaction hash (double SHA256 BE hex string)
     */
    txid?: string,
    /**
     * if not signActionRequired, fully signed transaction as LE hex string
     * 
     * if signActionRequired:
     *   - All length specified unlocking scripts are zero bytes
     *   - All SABPPP template unlocking scripts have zero byte signatures
     *   - All custom provided unlocking scripts fully copied.
     */
    rawTx?: string,
    /**
     * This is the fully-formed `inputs` field of this transaction, as per the SPV Envelope specification.
     */
    inputs: Record<string, EnvelopeEvidenceApi>,
    /**
     * If not `signActionRequired`, at least one valid mapi response.
     * may be a self-signed response if `acceptDelayedBroadcast` is true.
     * 
     * If `signActionRequired`, empty array.
     */
    mapiResponses?: MapiResponseApi[],
    /**
     * operational and performance logging if enabled.
     */
    log?: string
}
export interface SignActionParams {
    /**
     * each input's outputsToRedeem:
     *   - satoshis must be greater than zero, must match output's value.
     *   - spendingDescription length limit is 50, values are encrypted before leaving this device
     *   - unlockingScript must all be hex string.
     * 
     * Must match CreateActionParams with the exception of fully resolved unlockingScript values.
     *
     */
    inputs: Record<string, NinjaTxInputsApi>;
    /**
     * the dojo createTransaction results returned from createAction to be forwarded to signAction
     */
    createResult?: NinjaTransactionWithOutputsResultApi
    /**
     * Reserved Admin originators
     *   'projectbabbage.com'
     *   'staging-satoshiframe.babbage.systems'
     *   'satoshiframe.babbage.systems'
     */
    originator?: string;
    /**
     * true if local validation and self-signed mapi response is sufficient.
     * Upon return, transaction will have `sending` status. Watchman will proceed to send the transaction asynchronously.
     *
     * false if a valid mapi response from the bitcoin transaction processing network is required.
     * Upon return, transaction will have `unproven` status. Watchman will proceed to prove transaction.
     * 
     * Must match CreateActionParams value.
     *
     * default true
     */
    acceptDelayedBroadcast?: boolean;
    /**
     * Optional operational and performance logging prior data.
     */
    log?: string;
}
