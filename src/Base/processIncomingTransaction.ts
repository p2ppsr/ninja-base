/* eslint-disable @typescript-eslint/no-unused-vars */
import bsvJs from 'babbage-bsv'
import { Authrite } from 'authrite-js'
import { getPaymentPrivateKey } from 'sendover'

import { CwiError, ERR_INTERNAL } from "cwi-base";

import { DojoApi, ERR_DOJO_INVALID_SATOSHIS, ERR_DOJO_INVALID_SCRIPT, PendingTxApi, invoice3241645161d8 } from "@cwi/dojo-base";

import { KeyPairApi, NinjaTransactionFailedApi, NinjaTransactionFailedHandler, NinjaTransactionProcessedApi, NinjaTransactionProcessedHandler } from "../Api/NinjaApi";
import { NinjaBase } from './NinjaBase';
import { EnvelopeEvidenceApi } from 'cwi-external-services';


export async function processIncomingTransaction(
    ninja: NinjaBase,
    protocol: string,
    incomingTransaction: {
        rawTransaction: string,
        inputs: Record<string, EnvelopeEvidenceApi>
        outputs: {
            vout: number,
            satoshis: number,
            senderIdentityKey: string,
            derivationPrefix: string,
            derivationSuffix: string,
            paymailHandle?: string
        }[],
        referenceNumber?: string
    },
    clientKeys: KeyPairApi,
    updateStatus?: boolean
): Promise<NinjaTransactionProcessedApi | NinjaTransactionFailedApi> {

    const dojo = ninja.dojo
    const ptx = incomingTransaction

    try {
        const tx = new bsvJs.Transaction(ptx.rawTransaction)
        let amount = 0
        let senderIdentityKey: string | undefined = undefined
        let derivationPrefix: string | undefined = undefined

        if (protocol === '3241645161d8') { // SABPPP peer-to-peer payment protocol

            // Derive and check output scripts
            for (const out of ptx.outputs) {

                const invoiceNumber = invoice3241645161d8(
                    out.derivationPrefix,
                    out.derivationSuffix,
                    out.paymailHandle
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
                amount += out.satoshis

                if (senderIdentityKey && out.senderIdentityKey && senderIdentityKey !== out.senderIdentityKey)
                    throw new ERR_INTERNAL('outputs do not share common senderIdentityKey')
                senderIdentityKey ||= out.senderIdentityKey

                if (derivationPrefix && out.derivationPrefix && derivationPrefix !== out.derivationPrefix)
                    throw new ERR_INTERNAL('outputs do not share common derivationPrefix')
                derivationPrefix ||= out.derivationPrefix
            }

            if (updateStatus && ptx.referenceNumber) {
                await dojo.updateTransactionStatus(ptx.referenceNumber, 'completed')
            }

            if (!derivationPrefix) throw new ERR_INTERNAL('processIncomingTransaction without derivationPrefix')

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

            return returnValue

        } else {

            for (const out of ptx.outputs) {
                // Validate the output amounts
                // All other protocol validation is up to the user to be sure they follow the protocol specs
                if (tx.outputs[out.vout].satoshis !== out.satoshis) 
                    throw new ERR_DOJO_INVALID_SATOSHIS()
                amount += amount + out.satoshis
                
                if (senderIdentityKey && out.senderIdentityKey && senderIdentityKey !== out.senderIdentityKey)
                    throw new ERR_INTERNAL('outputs do not share common senderIdentityKey')
                senderIdentityKey ||= out.senderIdentityKey
            }

            if (updateStatus && ptx.referenceNumber) {
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

            return returnValue

        }

    } catch (e: unknown) {

        console.error('Received invalid incoming transaction, marking it as failed', e)

        if (updateStatus && ptx.referenceNumber) {
            try { await dojo.updateTransactionStatus(ptx.referenceNumber, 'failed') } catch { /* */ }
        }
        
        throw e
    }
}
