import { CwiError, DojoProcessTransactionParams, DojoProcessTransactionResultApi, stampLog } from "cwi-base"
import { NinjaBase } from "./NinjaBase"

export async function ninjaProcessTransaction(ninja: NinjaBase, params: DojoProcessTransactionParams)
: Promise<DojoProcessTransactionResultApi> {
    await ninja.verifyDojoAuthenticated()
    params.log = stampLog(params.log, `start ninja processTransaction acceptDelayedBroadcast=${params.acceptDelayedBroadcast}`)
    try {
        const r = await ninja.dojo.processTransaction(params)
        r.log = stampLog(r.log, 'end ninja processTransaction')
        return r
    } catch (eu: unknown) {
        const error = CwiError.fromUnknown(eu)

        // Free up UTXOs since the transaction failed before throwing the error
        // Unless there was a double spend error
        if (params.reference) {
            try {
                await ninja.updateTransactionStatus({
                    reference: params.reference,
                    status: 'failed'
                })
            } catch (e) { /* ignore, we still need the code below */ }
        }

        // In ninja v1, double spend processing occurred here which directly uses whatsonchain
        // services to ultimately...
        // 1. call `updateOutpointStatus` setting spendable false on UTXO's confirmed to have been spent
        // 2. Update the envelope for the spending transaction
        throw error
    }
}
