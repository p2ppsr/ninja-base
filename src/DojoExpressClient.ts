/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Chain, DojoAvatarApi, DojoCertificateApi, DojoClientApi, DojoClientUserApi, DojoCreateTransactionResultApi, DojoCreateTxOutputApi, DojoFeeModelApi, DojoGetTotalOfAmountsOptions, DojoGetTransactionOutputsOptions, DojoGetTransactionsOptions, DojoOutputApi, DojoOutputGenerationApi, DojoPendingTxApi, DojoStatsApi, DojoSubmitDirectTransactionApi, DojoSubmitDirectTransactionResultApi, DojoTransactionApi, DojoTransactionStatusApi, DojoTxInputSelectionApi, DojoTxInputsApi, ERR_CHAIN, ERR_INTERNAL, ERR_UNAUTHORIZED, EnvelopeApi, DojoProcessTransactionResultApi, ERR_INVALID_PARAMETER, asString, DojoUserStateApi, DojoSyncResultApi, CwiError, ERR_BAD_REQUEST
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
    authrite?: AuthriteClient

    identityKey?: string
}

/**
 * Connects to a DojoExpress to implement `DojoApi`
 */
export class DojoExpressClient implements DojoClientApi {
    static createDojoExpressClientOptions() : DojoExpressClientOptions {
        const options: DojoExpressClientOptions = {
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
        this.authrite = options?.authrite
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

    async authenticate(identityKey?: string, addIfNew?: boolean): Promise<void> {

        this._user = await this.postJson('/authenticate', { identityKey, addIfNew })

        if (!this._user) throw new ERR_UNAUTHORIZED('Unknown identityKey or unauthorized.')

        if (identityKey && identityKey !== this._user.identityKey)
            throw new ERR_INVALID_PARAMETER('identityKey', 'same as Authrite authenticated idenity')
    }

    getUser(): DojoClientUserApi {
        if (!this.isAuthenticated) throw new ERR_UNAUTHORIZED('Must already be autheticated.')
        if (!this._user) throw new ERR_INTERNAL()
        return this._user
    }

    async verifyAuthenticated() : Promise<void> {
        if (!this.isAuthenticated)
            await this.authenticate()
    }

    async syncIdentify(fromUserIdentityKey: string, fromDojoIdentityKey: string, fromDojoName?: string): Promise<DojoSyncResultApi> {
        this.verifyAuthenticated()
        return await this.postJson('/syncIdentify', { identityKey: this.identityKey, fromUserIdentityKey, fromDojoIdentityKey, fromDojoName})
    }
    async syncUpdate(state: DojoUserStateApi, fromDojoIdentityKey: string, when: Date, since?: Date): Promise<DojoSyncResultApi> {
        this.verifyAuthenticated()
        return await this.postJson('/syncUpdate', { identityKey: this.identityKey, state, fromDojoIdentityKey, when, since })
    }
    async getCurrentPaymails(): Promise<string[]> {
        this.verifyAuthenticated()
        return await this.postJson('/getCurrentPaymails', { identityKey: this.identityKey })
    }
    async getAvatar(): Promise<DojoAvatarApi> {
        this.verifyAuthenticated()
        return await this.postJson('/getAvatar', { identityKey: this.identityKey })
    }
    async setAvatar(avatar: DojoAvatarApi): Promise<void> {
        this.verifyAuthenticated()
        return await this.postJson('/setAvatar', { identityKey: this.identityKey, avatar })
    }
    async saveCertificate(certificate: DojoCertificateApi): Promise<number> {
        this.verifyAuthenticated()
        return await this.postJson('/saveCertificate', { identityKey: this.identityKey, certificate })
    }
    async findCertificates(certifiers?: string[], types?: Record<string, string[]>): Promise<DojoCertificateApi[]> {
        this.verifyAuthenticated()
        return await this.postJson('/findCertificate', { identityKey: this.identityKey, certifiers, types })
    }
    async getTotalOfUnspentOutputs(basket: string): Promise<number | undefined> {
        this.verifyAuthenticated()
        return await this.postJson('/getTotalOfUnspentOutputs', { identityKey: this.identityKey, basket })
    }
    async updateOutpointStatus(txid: string, vout: number, spendable: boolean): Promise<void> {
        this.verifyAuthenticated()
        await this.postJson('/updateOutpointStatus', { identityKey: this.identityKey, txid, vout, spendable })
    }
    async getTotalOfAmounts(direction: 'incoming' | 'outgoing', options?: DojoGetTotalOfAmountsOptions): Promise<number> {
        this.verifyAuthenticated()
        return await this.postJson('/getTotalOfAmounts', { identityKey: this.identityKey, direction, options })
    }
    async getNetOfAmounts(options?: DojoGetTotalOfAmountsOptions): Promise<number> {
        this.verifyAuthenticated()
        return await this.postJson('/getNetOfAmounts', { identityKey: this.identityKey, options })
    }
    async updateTransactionStatus(reference: string, status: DojoTransactionStatusApi): Promise<void> {
        this.verifyAuthenticated()
        await this.postJson('/updateTransactionStatus', { identityKey: this.identityKey, reference, status })
    }
    async getTransactions(options?: DojoGetTransactionsOptions): Promise<{ txs: DojoTransactionApi[]; total: number }> {
        this.verifyAuthenticated()
        return await this.postJson('/getTransactions', { identityKey: this.identityKey, options })
    }
    async getPendingTransactions(referenceNumber?: string): Promise<DojoPendingTxApi[]> {
        this.verifyAuthenticated()
        return await this.postJson('/getPendingTransactions', { identityKey: this.identityKey, referenceNumber })
    }
    async getEnvelopeForTransaction(txid: string) : Promise<EnvelopeApi | undefined> {
        this.verifyAuthenticated()
        return await this.postJson('/getEnvelopeForTransaction', { identityKey: this.identityKey, txid })
    }
    async getTransactionOutputs(options?: DojoGetTransactionOutputsOptions): Promise<{ outputs: DojoOutputApi[]; total: number }> {
        this.verifyAuthenticated()
        return await this.postJson('/getTransactionOutputs', { identityKey: this.identityKey, options })
    }
    async createTransaction(
        inputs: Record<string, DojoTxInputsApi>,
        inputSelection: DojoTxInputSelectionApi | undefined,
        outputs: DojoCreateTxOutputApi[],
        outputGeneration?: DojoOutputGenerationApi,
        feeModel?: DojoFeeModelApi,
        labels?: string[] | undefined,
        note?: string | undefined,
        recipient?: string | undefined
    ): Promise<DojoCreateTransactionResultApi> {
        this.verifyAuthenticated()
        return await this.postJson('/createTransaction', { identityKey: this.identityKey, inputs, inputSelection, outputs, outputGeneration, feeModel, labels, note, recipient })
    }
    async processTransaction(rawTx: string | Buffer, reference: string, outputMap: Record<string, number>): Promise<DojoProcessTransactionResultApi> {
        this.verifyAuthenticated()
        return await this.postJson('/processTransaction', { identityKey: this.identityKey, rawTx: asString(rawTx), reference, outputMap })
    }
    async submitDirectTransaction(
        protocol: string,
        transaction: DojoSubmitDirectTransactionApi,
        senderIdentityKey: string,
        note: string,
        labels: string[],
        derivationPrefix?: string
    ): Promise<DojoSubmitDirectTransactionResultApi> {
        this.verifyAuthenticated()
        return await this.postJson('/submitDirectTransaction', { identityKey: this.identityKey, protocol, transaction, senderIdentityKey, note, labels, derivationPrefix })
    }

    async copyState(): Promise<DojoUserStateApi> {
        this.verifyAuthenticated()
        return await this.postJson('/copyState', { identityKey: this.identityKey })
    }

    async getJsonOrUndefined<T>(path: string): Promise<T | undefined> {
        const r = await fetch(`${this.serviceUrl}${path}`)
        const v = <FetchStatus<T>>await r.json()
        if (v.status === 'success')
            return v.value
        throw new ERR_BAD_REQUEST(`path=${path} status=${v.status}`)
    }

    async getJson<T>(path: string): Promise<T> {
        const r = await this.getJsonOrUndefined<T>(path)
        if (r === undefined)
            throw new ERR_BAD_REQUEST(`path=${path}. Value was undefined. Requested object may not exist.`)
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
            throw new ERR_BAD_REQUEST(`path=${path} status=${s.status}`)
        } catch (eu: unknown) {
            const err = CwiError.fromUnknown(eu)
            err.description += `  <<path>> ${path}`
            //console.log(`Exception: ${JSON.stringify(err)}`)
            throw err
        }
    }

    async postJson<T, R>(path: string, params: T): Promise<R> {
        const r = await this.postJsonOrUndefined<T, R>(path, params)
        if (r === undefined)
            throw new ERR_BAD_REQUEST(`path=${path}. Value was undefined. Requested object may not exist.`)
        return r
    }

    async postJsonVoid<T>(path: string, params: T) : Promise<void> {
        await this.postJsonOrUndefined<T, void>(path, params)
    }

}