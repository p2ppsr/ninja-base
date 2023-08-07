/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { AuthriteClient } from "authrite-js"

import {
    Chain, DojoAvatarApi, DojoCertificateApi,
    DojoClientApi,
    DojoCreateTransactionResultApi,
    DojoCreateTxOutputApi,
    DojoFeeModelApi,
    DojoGetTotalOfAmountsOptions,
    DojoGetTransactionOutputsOptions,
    DojoGetTransactionsOptions,
    DojoOutputGenerationApi,
    DojoPendingTxApi,
    DojoProcessTransactionResultApi,
    DojoSubmitDirectTransactionResultApi,
    DojoTransactionStatusApi,
    DojoTxInputSelectionApi,
    DojoTxInputsApi,
    bsv,
    ERR_INVALID_PARAMETER, ERR_MISSING_PARAMETER, asString, verifyTruthy
} from "cwi-base"

import {
    KeyPairApi, NinjaApi, NinjaCreateTransactionParams, NinjaGetTransactionOutputsResultApi, NinjaGetTransactionsResultApi, NinjaGetTxWithOutputsProcessedResultApi, NinjaGetTxWithOutputsResultApi, NinjaSubmitDirectTransactionParams, NinjaSubmitDirectTransactionResultApi, NinjaTransactionFailedHandler, NinjaTransactionProcessedHandler,
    NinjaTxInputsApi
} from "../Api/NinjaApi";

import { processPendingTransactions } from "./processPendingTransactions";
import { getTransactionWithOutputs } from "./getTransactionWithOutputs";

export class NinjaBase implements NinjaApi {
    chain?: Chain

    constructor(public dojo: DojoClientApi, public clientPrivateKey?: string, public authrite?: AuthriteClient) {
    }

    async authenticate(identityKey?: string, addIfNew?: boolean): Promise<void> {
        if (this.clientPrivateKey) {
            const priv = bsv.PrivKey.fromBn(bsv.Bn.fromBuffer(
                Buffer.from(this.clientPrivateKey, 'hex'))
            )
            const identityPublicKey = bsv.PubKey.fromPrivKey(priv).toDer(true).toString('hex')
            await this.dojo.authenticate(identityPublicKey, addIfNew)
        } else if (identityKey) {
            await this.dojo.authenticate(identityKey, addIfNew)
        } else {
            throw new Error('yeee')
        }
    }

    getClientChangeKeyPair(): KeyPairApi {
        const ac = this.authrite.authrite
        const r: KeyPairApi = {
            privateKey: ac.clientPrivateKey,
            publicKey: ac.clientPublicKey            
        }
        return r
    }

    async getPaymail(): Promise<string> {
        const paymails = await this.dojo.getCurrentPaymails()
        return paymails[0]
    }
    
    async setPaymail(paymail: string): Promise<void> {
        throw new Error("Obsolete API.");
    }

    async getChain(): Promise<Chain> {
        this.chain ||= await this.dojo.getChain()
        return verifyTruthy(this.chain)
    }

    async getNetwork(format?: 'default' | 'nonet'): Promise<string> {
        let chain: string = await this.getChain()
        if (format !== 'nonet') chain += 'net'
        return chain
    }

    async findCertificates(certifiers?: string[] | object, types?: Record<string, string[]>): Promise<{ status: 'success', certificates: DojoCertificateApi[] }> {
        if (certifiers && !Array.isArray(certifiers)) {
            // Named Object Parameter Destructuring pattern conversion...
            types = certifiers['types']
            certifiers = certifiers['certifiers']
        }
        if (certifiers && !Array.isArray(certifiers)) throw new ERR_INVALID_PARAMETER('certifiers')
        if (types && typeof types !== 'object') throw new ERR_INVALID_PARAMETER('types')
        const certs = await this.dojo.findCertificates(certifiers, types)
        return { status: 'success', certificates: certs }
    }

    async saveCertificate(certificate: DojoCertificateApi | object): Promise<void> {
        if (certificate && typeof certificate === 'object' && certificate['certificate']) {
            certificate = certificate['certificate']
        }
        const cert = certificate as DojoCertificateApi
        await this.dojo.saveCertificate(cert)
    }

    async getTotalValue(basket?: string): Promise<number> {
        const total = await this.dojo.getTotalOfUnspentOutputs(basket || 'default')
        if (total === undefined) throw new ERR_MISSING_PARAMETER('basket', 'existing basket name')
        return total
    }

    async getTotalOfAmounts(options: DojoGetTotalOfAmountsOptions): Promise<{ total: number}> {
        const direction = options.direction
        if (!direction) throw new ERR_MISSING_PARAMETER('direction', 'incoming or outgoing')
        delete options.direction
        const total = await this.dojo.getTotalOfAmounts(direction, options)
        return { total }
    }

    async getNetOfAmounts(options?: DojoGetTotalOfAmountsOptions | undefined): Promise<number> {
        const total = await this.dojo.getNetOfAmounts(options)
        return total
    }
    
    async getAvatar(): Promise<DojoAvatarApi> {
        const a = await this.dojo.getAvatar()
        return a
    }

    async setAvatar(name: string, photoURL: string): Promise<void> {
        await this.dojo.setAvatar({ name, photoURL })
    }

    async updateTransactionStatus(params: { reference: string, status: DojoTransactionStatusApi }): Promise<void> {
        await this.dojo.updateTransactionStatus(params.reference, params.status)
    }
    
    async updateOutpointStatus(params: { txid: string, vout: number, spendable: boolean }): Promise<void> {
        await this.dojo.updateOutpointStatus(params.txid, params.vout, params.spendable)
    }

    async getTransactions(options?: DojoGetTransactionsOptions): Promise<NinjaGetTransactionsResultApi> {
        const r = await this.dojo.getTransactions(options)
        const rr: NinjaGetTransactionsResultApi = {
            totalTransactions: r.total,
            transactions: r.txs.map(t => ({
                txid: t.txid,
                amount: t.amount,
                status: t.status,
                senderPaymail: t.senderPaymail || '',
                recipientPaymail: t.recipientPaymail || '',
                isOutgoing: t.isOutgoing,
                note: t.note || '',
                created_at: t.created_at instanceof Date ? t.created_at.toISOString() : t.created_at || '',
                referenceNumber: t.referenceNumber || '',
                labels: t.labels || []
            }))
        }
        return rr
    }

    async getPendingTransactions(referenceNumber?: string): Promise<DojoPendingTxApi[]> {
        const r = await this.dojo.getPendingTransactions(referenceNumber)
        return r
    }

    async processPendingTransactions(onTransactionProcessed?: NinjaTransactionProcessedHandler, onTransactionFailed?: NinjaTransactionFailedHandler)
    : Promise<void> {
        await processPendingTransactions(this, onTransactionProcessed, onTransactionFailed)
    }

    async getTransactionOutputs(options?: DojoGetTransactionOutputsOptions): Promise<NinjaGetTransactionOutputsResultApi[]> {
        const r = await this.dojo.getTransactionOutputs(options)
        const gtors: NinjaGetTransactionOutputsResultApi[] = r.outputs
            .filter(x => x.txid && typeof x.vout === 'number' && typeof x.amount === 'number' && x.outputScript)
            .map(x => ({
            txid: x.txid || '',
            vout: x.vout || 0,
            amount: x.amount || 0,
            outputScript: asString(x.outputScript || ''),
            type: x.type,
            spendable: x.spendable
        }))
        return gtors
    }

    async processTransaction(params: {
        submittedTransaction: string | Buffer,
        reference: string,
        outputMap: Record<string, number>
    }): Promise<DojoProcessTransactionResultApi> {
        const r = await this.dojo.processTransaction(params.submittedTransaction, params.reference, params.outputMap)
        return r
    }
    
    async getTransactionWithOutputs(params: {
        outputs: DojoCreateTxOutputApi[],
        labels?: string[],
        inputs?: Record<string, NinjaTxInputsApi>,
        note?: string,
        recipient?: string,
        autoProcess?: boolean | undefined,
        feePerKb?: number | undefined
    }): Promise<NinjaGetTxWithOutputsResultApi | NinjaGetTxWithOutputsProcessedResultApi> {
        const r = await getTransactionWithOutputs(this,
            params.outputs,
            params.labels,
            params.inputs,
            params.note,
            params.recipient,
            params.autoProcess,
            params.feePerKb)
        return r
    }
    
    async createTransaction(params: NinjaCreateTransactionParams): Promise<DojoCreateTransactionResultApi> {
        const r = await this.dojo.createTransaction(
            params.inputs,
            params.inputSelection,
            params.outputs,
            params.outputGeneration,
            params.fee,
            params.labels,
            params.note,
            params.recipient
        )
        return r
    }


    async submitDirectTransaction(params: NinjaSubmitDirectTransactionParams)
    : Promise<NinjaSubmitDirectTransactionResultApi> {
        const r = await this.dojo.submitDirectTransaction(
            params.protocol,
            params.transaction,
            params.senderIdentityKey,
            params.note,
            params.labels,
            params.derivationPrefix
        )
        return r
    }
}
