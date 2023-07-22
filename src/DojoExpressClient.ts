/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Chain, DojoAvatarApi, DojoCertificateApi, DojoClientApi, DojoClientUserApi, DojoCreateTransactionResultApi, DojoCreateTxOutputApi, DojoFeeModelApi, DojoGetTotalOfAmountsOptions, DojoGetTransactionOutputsOptions, DojoGetTransactionsOptions, DojoOutputApi, DojoOutputGenerationApi, DojoPendingTxApi, DojoStatsApi, DojoSubmitDirectTransactionApi, DojoSubmitDirectTransactionResultApi, DojoTransactionApi, DojoTransactionStatusApi, DojoTxInputSelectionApi, DojoTxInputsApi, ERR_CHAIN, ERR_INTERNAL, ERR_UNAUTHORIZED, EnvelopeApi, DojoProcessTransactionResultApi
} from 'cwi-base'

import { AuthriteClient } from 'authrite-js'

import fetch from 'node-fetch'

interface FetchStatus<T> {
    status: 'success' | 'error',
    code?: string,
    description?: string,
    value?: T
}

export interface DojoExpressClientOptions {
    useAuthrite: boolean

    identityKey?: string
}

/**
 * Connects to a DojoExpress to implement `DojoApi`
 */
export class DojoExpressClient implements DojoClientApi {
    static createDojoExpressClientOptions() : DojoExpressClientOptions {
        const options: DojoExpressClientOptions = {
            useAuthrite: false
        }
        return options
    }

    authrite?: AuthriteClient
    options: DojoExpressClientOptions

    private _user: DojoClientUserApi | undefined
    get userId() : number { return this._user?.userId || 0 }
    get identityKey() : string { return this._user?.identityKey || "" }
    get isAuthenticated(): boolean { return this._user !== undefined }

    constructor (public chain: Chain, public serviceUrl: string, options?: DojoExpressClientOptions) {
        this.options = options || DojoExpressClient.createDojoExpressClientOptions()
        if (this.options.useAuthrite) {
            this.authrite = new AuthriteClient(serviceUrl)
        }
    }

    //
    // HTTP API FUNCTIONS
    //
    
    async getChain(): Promise<Chain> {
        const chain: Chain = await this.getJson('/getChain')
        if (this.chain !== chain)
            throw new ERR_CHAIN(`DojoExpressClient on ${this.chain} configured to use DojoExpress server on ${chain}.`)
        return chain
    }
    
    async stats(): Promise<DojoStatsApi> { return await this.getJson('/stats') }

    async authenticate(identityKey: string, addIfNew: boolean): Promise<void> {
        this._user = await this.postJson('/authenticate', { identityKey, addIfNew })
        if (!this._user) throw new ERR_UNAUTHORIZED('Unknown identityKey')
    }

    verifyAuthenticated() {
        if (!this.isAuthenticated) throw new ERR_UNAUTHORIZED('This Dojo Api requires authentication.')
    }

    getUser(): DojoClientUserApi {
        this.verifyAuthenticated()
        if (!this._user) throw new ERR_INTERNAL()
        return this._user
    }

    async getCurrentPaymails(): Promise<string[]> {
        this.verifyAuthenticated()
        return await this.postJson('/getCurrentPaymails', { identityKey: this.identityKey })
    }

    getAvatar(): Promise<DojoAvatarApi> {
        throw new Error('Method not implemented.')
    }
    setAvatar(avatar: DojoAvatarApi): Promise<void> {
        throw new Error('Method not implemented.')
    }

    saveCertificate(certificate: DojoCertificateApi): Promise<number> {
        throw new Error('Method not implemented.')
    }
    findCertificates(certifiers?: string[], types?: Record<string, string[]>): Promise<DojoCertificateApi[]> {
        throw new Error('Method not implemented.')
    }
    getTotalOfUnspentOutputs(basket: string): Promise<number> {
        throw new Error('Method not implemented.')
    }
    updateOutpointStatus(txid: string, vout: number, spendable: boolean): Promise<void> {
        throw new Error('Method not implemented.')
    }
    getTotalOfAmounts(direction: 'incoming' | 'outgoing', options?: DojoGetTotalOfAmountsOptions): Promise<number> {
        throw new Error('Method not implemented.')
    }
    getNetOfAmounts(options?: DojoGetTotalOfAmountsOptions): Promise<number> {
        throw new Error('Method not implemented.')
    }
    updateTransactionStatus(reference: string, status: DojoTransactionStatusApi): Promise<void> {
        throw new Error('Method not implemented.')
    }
    getTransactions(options?: DojoGetTransactionsOptions): Promise<{ txs: DojoTransactionApi[]; total: number }> {
        throw new Error('Method not implemented.')
    }
    getPendingTransactions(referenceNumber?: string): Promise<DojoPendingTxApi[]> {
        throw new Error('Method not implemented.')
    }
    getEnvelopeForTransaction(txid: string) : Promise<EnvelopeApi | undefined> {
        throw new Error('Method not implemented.')
    }
    getTransactionOutputs(options?: DojoGetTransactionOutputsOptions): Promise<{ outputs: DojoOutputApi[]; total: number }> {
        throw new Error('Method not implemented.')
    }
    createTransaction(inputs: Record<string, DojoTxInputsApi>, inputSelection: DojoTxInputSelectionApi | undefined, outputs: DojoCreateTxOutputApi[], outputGeneration: DojoOutputGenerationApi | undefined, feeModel: DojoFeeModelApi, labels?: string[] | undefined, note?: string | undefined, recipient?: string | undefined): Promise<DojoCreateTransactionResultApi> {
        throw new Error('Method not implemented.')
    }
    processTransaction(rawTx: string | Buffer, reference: string, outputMap: Record<string, number>): Promise<DojoProcessTransactionResultApi> {
        throw new Error('Method not implemented.')
    }
    submitDirectTransaction(protocol: string, transaction: DojoSubmitDirectTransactionApi, senderIdentityKey: string, note: string, labels: string[], derivationPrefix?: string | undefined): Promise<DojoSubmitDirectTransactionResultApi> {
        throw new Error('Method not implemented.')
    }

    async getJsonOrUndefined<T>(path: string): Promise<T | undefined> {
        const r = await fetch(`${this.serviceUrl}${path}`)
        const v = <FetchStatus<T>>await r.json()
        if (v.status === 'success')
            return v.value
        throw new Error(JSON.stringify(v))
    }

    async getJson<T>(path: string): Promise<T> {
        const r = await this.getJsonOrUndefined<T>(path)
        if (r === undefined)
            throw new Error('Value was undefined. Requested object may not exist.')
        return r
    }

    async postJsonOrUndefined<T, R>(path: string, params: T) : Promise<R | undefined> {
        let s: FetchStatus<R>
        try {
            if (this.authrite) {
                // eslint-disable-next-line no-debugger
                s = <FetchStatus<R>>await this.authrite.createSignedRequest(path, params)
            } else {
                const headers = {}
                headers['Content-Type'] = 'application/json'
                const r = await fetch(`${this.serviceUrl}${path}`, {
                    body: JSON.stringify(params),
                    method: 'POST',
                    headers,
                    //cache: 'no-cache',
                })
                s = <FetchStatus<R>>await r.json()
            }
            if (s.status === 'success')
                return s.value
            throw new Error(JSON.stringify(s))
        } catch (e) {
            console.log(`Exception: ${JSON.stringify(e)}`)
            throw new Error(JSON.stringify(e))
        }
    }

    async postJson<T, R>(path: string, params: T): Promise<R> {
        const r = await this.postJsonOrUndefined<T, R>(path, params)
        if (r === undefined)
            throw new Error('Value was undefined. Requested object may not exist.')
        return r
    }

    async postJsonVoid<T>(path: string, params: T) : Promise<void> {
        await this.postJsonOrUndefined<T, void>(path, params)
    }

}