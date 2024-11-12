import { NinjaBase } from "./NinjaBase"
import { DojoCreateTransactionResultApi, DojoProcessTransactionParams } from "cwi-base"
import { NinjaCreateActionParams, NinjaCreateActionResult } from "../Api/NinjaApi"
import { OutPoint } from "@babbage/sdk-ts"

export async function ninjaCreateAction(ninja: NinjaBase, ninjaParams: NinjaCreateActionParams): Promise<NinjaCreateActionResult> {

    const params = ninjaParams.params
    const options = params.options || {}

    const createResult = await ninja.createTransactionWithOutputs({
        ...params,
        labels: [`babbage_app_${'createActionCloudNinja'}`, ...(params.labels || [])],
    })

    if (ninjaParams.confirmCreateTransactionResult) {
        const confirmResult = await ninjaParams.confirmCreateTransactionResult(createResult)
        if (!confirmResult.proceedToSign) {
            return {
                proceedToSign: false
            }
        }
    }

    function convertNoSendChange(
        txid: string,
        cr?: DojoCreateTransactionResultApi
    ) : OutPoint[] | undefined {
        if (!cr?.noSendChangeOutputVouts) return undefined
        return cr.noSendChangeOutputVouts.map(vout => ({ txid, vout }))
    }

    const params2: DojoProcessTransactionParams = {
        reference: createResult.referenceNumber,
        beef: createResult.beef,
        submittedTransaction: createResult.rawTx,
        options: createResult.options,
        log: createResult.log
    }

    const ptr = await ninja.processTransaction(params2)

    const r: NinjaCreateActionResult = {
        proceedToSign: true,
        result: {
            txid: ptr.txid,
            rawTx: ptr.rawTx,
            inputs: createResult.inputs,
            beef: createResult.beef,
            options,
            noSendChange: convertNoSendChange(ptr.txid, createResult.createResult),
            mapiResponses: ptr.mapiResponses,
            sendWithResults: ptr.sendWithResults,
            log: ptr.log,
        }
    }

    return r
}
