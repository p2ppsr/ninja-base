import {  NinjaTransactionFailedHandler,  NinjaTransactionProcessedHandler } from "../Api/NinjaApi";
import { DojoApi, ERR_DOJO_PROCESS_PENDING_OUTGOING } from "@cwi/dojo-base";
import { Authrite } from 'authrite-js'
import { processIncomingTransaction } from "./processIncomingTransaction";

export async function processPendingTransactions(
    dojo: DojoApi,
    authriteClient: Authrite,
    onTransactionProcessed?: NinjaTransactionProcessedHandler,
    onTransactionFailed?: NinjaTransactionFailedHandler
): Promise<void> {

    const pending = await dojo.getPendingTransactions()

    await Promise.all(pending.map(async ptx => {
        if (!ptx.isOutgoing) {
            await processIncomingTransaction(
                ptx,
                dojo,
                authriteClient,
                undefined,
                true,
                onTransactionProcessed,
                onTransactionFailed
            )
        } else {
            // Pending outgoing transactions ...
            // There was a try block here that would always throw due to the following line
            // const derivationSuffix = out.instructions.derivationSuffix
            // because out had no instructions from getPendingTransactions
            // TODO: think through what realy should be happening for outgoing transactions...
            const e = new ERR_DOJO_PROCESS_PENDING_OUTGOING()
            const r = {
                error: e,
                inputs: ptx.inputs,
                isOutgoing: ptx.isOutgoing,
                reference: ptx.referenceNumber
            }
            if (onTransactionFailed) {
                try {
                    await onTransactionFailed(r)
                } catch (e) {
                    console.error('onTransactionFailed callback threw', e)
                }
            }
            try {
                await dojo.updateTransactionStatus( ptx.referenceNumber, 'failed' )
            } catch (e) { /* ignore, so that we can still deal with other TXs */ }
            // pending incoming transactions are first validated and then their status is updated to be completed or failed
            return e
        }
    }))
}
