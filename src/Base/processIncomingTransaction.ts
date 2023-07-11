/* eslint-disable @typescript-eslint/no-unused-vars */
import bsvJs from 'babbage-bsv'

import { getPaymentPrivateKey } from 'sendover'

import { CwiError, ERR_INTERNAL } from "cwi-base"

import { ERR_DOJO_INVALID_SATOSHIS, ERR_DOJO_INVALID_SCRIPT, PendingTxApi, invoice3241645161d8, verifyTruthy } from "@cwi/dojo-base";

import { NinjaSubmitDirectTransactionApi, NinjaTransactionFailedHandler, NinjaTransactionProcessedApi, NinjaTransactionProcessedHandler } from "../Api/NinjaApi";
import { NinjaBase } from './NinjaBase'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ProcessIncomingTransactionInputApi {
    /* */
}

export interface ProcessIncomingTransactionOutputApi {
    vout?: number
    satoshis?: number
    amount?: number
    senderIdentityKey?: string
    derivationSuffix?: string
    derivationPrefix?: string
    paymailHandle?: string
}

export interface ProcessIncomingTransactionApi {
    inputs?: Record<string, ProcessIncomingTransactionInputApi>
    outputs: ProcessIncomingTransactionOutputApi[]
    referenceNumber?: string
    rawTransaction?: string
    rawTx?: string
    derivationPrefix?: string
}

export interface ProcessIncomingTransactionResultApi {
    txid: string
    amount: number
    derivationPrefix?: string
    senderIdentityKey?: string
}

/**
 * Verifies protocol '3241645161d8' output scripts with derivedSuffix based addresses.
 * Computes transaction 'amount'.
 * 
 * @param ninja 
 * @param incomingTransaction 
 * @param protocol 
 * @param updateStatus 
 * @param onTransactionProcessed 
 * @param onTransactionFailed 
 * @returns Void on error if onTransactionFailed handler is provided.
 */
export async function processIncomingTransaction(
    ninja: NinjaBase,
    incomingTransaction: ProcessIncomingTransactionApi,
    protocol?: string,
    updateStatus?: boolean,
): Promise<ProcessIncomingTransactionResultApi> {

    const dojo = ninja.dojo
    const ptx = incomingTransaction
    const rawTx = ptx.rawTransaction || ptx.rawTx || ''
    verifyTruthy(rawTx)

    const clientKeys = ninja.getClientChangeKeyPair()

    const tx = new bsvJs.Transaction(rawTx)
    let amount = 0
    let senderIdentityKey: string | undefined = undefined
    let derivationPrefix: string | undefined = undefined

    if (protocol === '3241645161d8') { // SABPPP peer-to-peer payment protocol

        // Derive and check output scripts
        for (const out of ptx.outputs) {
            
            verifyTruthy(out.vout)
            out.satoshis ||= out.amount

            if (derivationPrefix && out.derivationPrefix && derivationPrefix !== out.derivationPrefix)
                throw new ERR_INTERNAL('outputs do not share common derivationPrefix')
            derivationPrefix ||= out.derivationPrefix || verifyTruthy(incomingTransaction.derivationPrefix)

            const invoiceNumber = invoice3241645161d8(
                derivationPrefix,
                verifyTruthy(out.derivationSuffix),
                out.paymailHandle || undefined
            )

            // Derive the public key used for creating the output script
            const derivedPrivateKey = getPaymentPrivateKey({
                senderPublicKey: out.senderIdentityKey,
                recipientPrivateKey: clientKeys.privateKey,
                invoiceNumber,
                returnType: 'wif'
            })
            const derivedAddress = bsvJs.Address.fromPrivateKey(
                bsvJs.PrivateKey.fromWIF(derivedPrivateKey)
            )

            const expectedScript = new bsvJs.Script(bsvJs.Script.fromAddress(derivedAddress)).toHex()
            if (tx.outputs[out.vout].script.toHex() !== expectedScript)
                throw new ERR_DOJO_INVALID_SCRIPT('Transaction output script invalid')

            if (tx.outputs[out.vout].satoshis !== out.satoshis)
                throw new ERR_DOJO_INVALID_SATOSHIS()
            amount += (out.satoshis || 0)

            if (senderIdentityKey && out.senderIdentityKey && senderIdentityKey !== out.senderIdentityKey)
                throw new ERR_INTERNAL('outputs do not share common senderIdentityKey')
            senderIdentityKey ||= out.senderIdentityKey || undefined
        }

        if (updateStatus && ptx.referenceNumber) {
            await dojo.updateTransactionStatus(ptx.referenceNumber, 'completed')
        }

        if (!derivationPrefix) throw new ERR_INTERNAL('processIncomingTransaction without derivationPrefix')

        const returnValue = {
            txid: tx.id,
            amount,
            derivationPrefix,
            senderIdentityKey
        }

        return returnValue

    } else {

        for (const out of ptx.outputs) {

            verifyTruthy(out.vout)
            out.satoshis ||= out.amount

            // Validate the output amounts
            // All other protocol validation is up to the user to be sure they follow the protocol specs
            if (tx.outputs[out.vout].satoshis !== out.satoshis)
                throw new ERR_DOJO_INVALID_SATOSHIS()
            amount += (out.satoshis || 0)

            if (senderIdentityKey && out.senderIdentityKey && senderIdentityKey !== out.senderIdentityKey)
                throw new ERR_INTERNAL('outputs do not share common senderIdentityKey')
            senderIdentityKey ||= out.senderIdentityKey || undefined
        }

        if (updateStatus && ptx.referenceNumber) {
            await dojo.updateTransactionStatus(ptx.referenceNumber, 'completed')
        }

        const returnValue = {
            txid: tx.id,
            amount,
            senderIdentityKey,
        }

        return returnValue
    }
}
