import { CreateActionParams, CreateActionResult } from "@babbage/sdk-ts";
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
