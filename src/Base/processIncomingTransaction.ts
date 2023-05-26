/* eslint-disable @typescript-eslint/no-unused-vars */
import { NinjaTransactionFailedApi, NinjaTransactionFailedHandler, NinjaTransactionProcessedApi, NinjaTransactionProcessedHandler } from "../Api/NinjaApi";
import { DojoApi, ERR_DOJO_INVALID_SATOSHIS, ERR_DOJO_INVALID_SCRIPT, PendingTxApi } from "@cwi/dojo-base";
import { Authrite } from 'authrite-js'

import bsv from 'babbage-bsv'
import { CwiError, ERR_INTERNAL } from "cwi-base";
import { getPaymentPrivateKey } from 'sendover'

export async function processIncomingTransaction(
    incomingTransaction: PendingTxApi,
    dojo: DojoApi,
    authriteClient: Authrite,
    protocol?: string,
    updateStatus?: boolean,
    onTransactionProcessed?: NinjaTransactionProcessedHandler,
    onTransactionFailed?: NinjaTransactionFailedHandler
): Promise<NinjaTransactionProcessedApi | NinjaTransactionFailedApi> {

    const ptx = incomingTransaction

    try {
        const tx = new bsv.Transaction(ptx.rawTransaction)
        let amount = 0
        let senderIdentityKey: string | null = null
        let derivationPrefix: string | null = null

        if (protocol === '3241645161d8') { // SABPPP peer-to-peer payment protocol
            // Derive and check output scripts
            for (const out of ptx.outputs) {
                const derivationSuffix = out.derivationSuffix
                const invoiceNumber = out.paymailHandle
                    ? `2-3241645161d8-${out.paymailHandle} ${out.derivationPrefix} ${derivationSuffix}`
                    : `2-3241645161d8-${out.derivationPrefix} ${derivationSuffix}`
                // Derive the public key used for creating the output script
                const derivedPrivateKey = getPaymentPrivateKey({
                    senderPublicKey: out.senderIdentityKey,
                    recipientPrivateKey: authriteClient.clientPrivateKey,
                    invoiceNumber,
                    returnType: 'wif'
                })
                const derivedAddress = bsv.Address.fromPrivateKey(
                    bsv.PrivateKey.fromWIF(derivedPrivateKey)
                )
                const expectedScript = new bsv.Script(
                    bsv.Script.fromAddress(derivedAddress)
                ).toHex()
                if (tx.outputs[out.vout].script.toHex() !== expectedScript) {
                    throw new ERR_DOJO_INVALID_SCRIPT('Transaction output script invalid')
                }
                if (tx.outputs[out.vout].satoshis !== out.satoshis) {
                    throw new ERR_DOJO_INVALID_SATOSHIS()
                }
                senderIdentityKey = out.senderIdentityKey
                derivationPrefix = out.derivationPrefix
                amount += out.satoshis
            }
            if (updateStatus) {
                await dojo.updateTransactionStatus(ptx.referenceNumber, 'completed')
            }
            if (!derivationPrefix) throw new ERR_INTERNAL('processIncomingTransaction with zero outputs.')
            const returnValue = {
                inputs: ptx.inputs,
                isOutgoing: false,
                hex: ptx.rawTransaction,
                outputs: ptx.outputs,
                senderIdentityKey,
                derivationPrefix,
                txid: tx.id,
                reference: ptx.referenceNumber,
                amount
            }
            if (onTransactionProcessed) {
                try {
                    await onTransactionProcessed(returnValue)
                } catch (e) {
                    console.error('onTransactionProcessed callback threw', e)
                }
            }
            return returnValue
        } else {
            for (const out of ptx.outputs) {
                // Validate the output amounts
                // All other protocol validation is up to the user to be sure they follow the protocol specs
                if (tx.outputs[out.vout].satoshis !== out.satoshis) {
                    throw new ERR_DOJO_INVALID_SATOSHIS()
                }
                senderIdentityKey = out.senderIdentityKey
                amount += amount + out.satoshis
            }
            if (updateStatus) {
                await dojo.updateTransactionStatus(ptx.referenceNumber, 'completed')
            }
            const returnValue = {
                inputs: ptx.inputs,
                isOutgoing: false,
                hex: ptx.rawTransaction,
                outputs: ptx.outputs,
                senderIdentityKey,
                txid: tx.id,
                reference: ptx.referenceNumber,
                amount
            }
            if (onTransactionProcessed) {
                try {
                    await onTransactionProcessed(returnValue)
                } catch (e) {
                    console.error('onTransactionProcessed callback threw', e)
                }
            }
            return returnValue
        }
    } catch (e: unknown) {
        console.error('Received invalid incoming transaction, marking it as failed', e)
        if (updateStatus) {
            try { await dojo.updateTransactionStatus(ptx.referenceNumber, 'completed') } catch { /* */ }
        }
        const er = {
            error: CwiError.fromUnknown(e),
            inputs: ptx.inputs,
            isOutgoing: false,
            reference: ptx.referenceNumber
        }
        if (onTransactionFailed) {
            try {
                await onTransactionFailed(er)
            } catch (e) {
                console.error('onTransactionFailed callback threw', e)
            }
        }
        return er
    }
}
