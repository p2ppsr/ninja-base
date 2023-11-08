/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Chain, DojoAvatarApi, DojoCertificateApi, DojoClientApi, DojoClientUserApi, DojoCreateTransactionResultApi,
  DojoCreateTxOutputApi, DojoFeeModelApi, DojoGetTotalOfAmountsOptions, DojoGetTransactionOutputsOptions,
  DojoGetTransactionsOptions, DojoOutputApi, DojoOutputGenerationApi, DojoPendingTxApi, DojoStatsApi,
  DojoSubmitDirectTransactionApi, DojoSubmitDirectTransactionResultApi, DojoTransactionApi, DojoTransactionStatusApi,
  DojoTxInputSelectionApi, DojoTxInputsApi, ERR_CHAIN, ERR_INTERNAL, ERR_UNAUTHORIZED, EnvelopeApi,
  DojoProcessTransactionResultApi, ERR_INVALID_PARAMETER, asString, DojoUserStateApi,
  CwiError, ERR_BAD_REQUEST, DojoSyncApi, DojoSyncOptionsApi, DojoSyncIdentifyParams, DojoSyncIdentifyResultApi,
  DojoSyncUpdateParams, DojoSyncUpdateResultApi, DojoSyncMergeParams, DojoSyncMergeResultApi,
  restoreUserStateEntities, DojoIdentityApi, SyncDojoConfigBaseApi, validateDate, DojoGetTransactionLabelsOptions, DojoTxLabelApi, DojoOutputTagApi, DojoOutputBasketApi, DojoGetTransactionOutputsResultApi, DojoGetTransactionsResultApi, DojoGetTransactionLabelsResultApi, DojoSubmitDirectTransactionParams, DojoCreateTransactionParams,
} from 'cwi-base'

import { AuthriteClient } from 'authrite-js'

import fetch from 'node-fetch'

interface FetchStatus<T> {
  status: 'success' | 'error'
  code?: string
  description?: string
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
  static createDojoExpressClientOptions (): DojoExpressClientOptions {
    const options: DojoExpressClientOptions = {
    }
    return options
  }

  authrite?: AuthriteClient
  options: DojoExpressClientOptions

  private _user: DojoClientUserApi | undefined
  get userId (): number { return this._user?.userId || 0 }
  get identityKey (): string { return this._user?.identityKey || '' }
  get isAuthenticated (): boolean { return this._user !== undefined }

  /**
   * Only vaild if this dojo was created as a syncDojo by setSyncDojosByConfig
   */
  syncDojoConfig?: SyncDojoConfigBaseApi

  /**
   * The authrite options setting may be left undefined if it will be created
   * by NinjaBase.
   * 
   * @param chain 
   * @param serviceUrl 
   * @param options 
   */
  constructor (public chain: Chain, public serviceUrl: string, options?: DojoExpressClientOptions) {
    this.options ||= DojoExpressClient.createDojoExpressClientOptions()
    this.authrite = options?.authrite
  }

  async destroy(): Promise<void> {
    // Nothing to destroy
  }

  //
  // HTTP API FUNCTIONS
  //

  async getChain (): Promise<Chain> {
    const chain: Chain = await this.getJson('/getChain')
    if (this.chain !== chain) { throw new ERR_CHAIN(`DojoExpressClient on ${this.chain} configured to use DojoExpress server on ${chain}.`) }
    return chain
  }

  async stats (): Promise<DojoStatsApi> { return await this.getJson('/stats') }

  async getDojoIdentity(): Promise<DojoIdentityApi> { return await this.getJson('/getDojoIdentity') }

  async authenticate (identityKey?: string, addIfNew?: boolean): Promise<void> {
    this._user = await this.postJson('/authenticate', { identityKey, addIfNew })

    if (this._user == null) throw new ERR_UNAUTHORIZED('Unknown identityKey or unauthorized.')

    if (identityKey && identityKey !== this._user.identityKey) { throw new ERR_INVALID_PARAMETER('identityKey', 'same as Authrite authenticated identity') }
  }

  getUser (): DojoClientUserApi {
    if (!this.isAuthenticated) throw new ERR_UNAUTHORIZED('Must already be autheticated.')
    if (this._user == null) throw new ERR_INTERNAL()
    return this._user
  }

  async verifyAuthenticated (): Promise<void> {
    if (!this.isAuthenticated) { await this.authenticate() }
  }

  async getSyncDojoConfig(): Promise<SyncDojoConfigBaseApi> {
    let config = this.syncDojoConfig
    if (!config) {
        const s = await this.getDojoIdentity()
        config = {
            dojoType: '<custom>',
            dojoIdentityKey: s.dojoIdentityKey,
            dojoName: s.dojoName
        }
    }
    return config
  }

  setSyncDojos (dojos: DojoSyncApi[], syncOptions?: DojoSyncOptionsApi | undefined): void {
    throw new ERR_BAD_REQUEST('DojoExpressClient does not support setSyncDojos.')
  }

  getSyncDojos (): { dojos: DojoSyncApi[], options: DojoSyncOptionsApi } {
    throw new ERR_BAD_REQUEST('DojoExpressClient does not support getSyncDojos.')
  }

  async setSyncDojosByConfig(syncDojoConfigs: SyncDojoConfigBaseApi[], options?: DojoSyncOptionsApi | undefined): Promise<void> {
    throw new ERR_BAD_REQUEST('DojoExpressClient does not support setSyncDojosByConfig.')
  }

  async getSyncDojosByConfig(): Promise<{ dojos: SyncDojoConfigBaseApi[]; options?: DojoSyncOptionsApi | undefined }> {
    throw new ERR_BAD_REQUEST('DojoExpressClient does not support getSyncDojosByConfig.')
  }

  async sync (): Promise<void> {
    this.verifyAuthenticated()
    await this.postJsonVoid('/sync', { identityKey: this.identityKey })
  }

  async syncIdentify(params: DojoSyncIdentifyParams): Promise<DojoSyncIdentifyResultApi> {
    // /syncIdentify without authentication
    const r:DojoSyncIdentifyResultApi = await this.postJson('/syncIdentify', params, true)
    r.when = validateDate(r.when)
    return r
  }

  async syncUpdate (params: DojoSyncUpdateParams): Promise<DojoSyncUpdateResultApi> {
    this.verifyAuthenticated()
    const r = await this.postJson('/syncUpdate', { identityKey: this.identityKey, params }) as DojoSyncUpdateResultApi
    if (r.state != null) restoreUserStateEntities(r.state)
    r.since = validateDate(r.since)
    return r
  }

  async syncMerge (params: DojoSyncMergeParams): Promise<DojoSyncMergeResultApi> {
    this.verifyAuthenticated()
    const r:DojoSyncMergeResultApi = await this.postJson('/syncMerge', { identityKey: this.identityKey, params })
    return r
  }

  async getCurrentPaymails (): Promise<string[]> {
    this.verifyAuthenticated()
    return await this.postJson('/getCurrentPaymails', { identityKey: this.identityKey })
  }

  async getAvatar (): Promise<DojoAvatarApi> {
    this.verifyAuthenticated()
    return await this.postJson('/getAvatar', { identityKey: this.identityKey })
  }

  async setAvatar (avatar: DojoAvatarApi): Promise<void> {
    this.verifyAuthenticated()
    await this.postJsonVoid('/setAvatar', { identityKey: this.identityKey, avatar })
  }

  async saveCertificate (certificate: DojoCertificateApi): Promise<number> {
    this.verifyAuthenticated()
    return await this.postJson('/saveCertificate', { identityKey: this.identityKey, certificate })
  }

  async findCertificates (certifiers?: string[], types?: Record<string, string[]>): Promise<DojoCertificateApi[]> {
    this.verifyAuthenticated()
    const rs:DojoCertificateApi[] = await this.postJson('/findCertificate', { identityKey: this.identityKey, certifiers, types })
    for (const r of rs) {
      r.created_at = validateDate(r.created_at)
      r.updated_at = validateDate(r.updated_at)  
    }
    return rs
  }

  async getTotalOfUnspentOutputs (basket?: string): Promise<number | undefined> {
    this.verifyAuthenticated()
    return await this.postJson('/getTotalOfUnspentOutputs', { identityKey: this.identityKey, basket })
  }

  async updateOutpointStatus (txid: string, vout: number, spendable: boolean): Promise<void> {
    this.verifyAuthenticated()
    await this.postJsonVoid('/updateOutpointStatus', { identityKey: this.identityKey, txid, vout, spendable })
  }

  async getTotalOfAmounts (direction: 'incoming' | 'outgoing', options?: DojoGetTotalOfAmountsOptions): Promise<number> {
    this.verifyAuthenticated()
    return await this.postJson('/getTotalOfAmounts', { identityKey: this.identityKey, direction, options })
  }

  async getNetOfAmounts (options?: DojoGetTotalOfAmountsOptions): Promise<number> {
    this.verifyAuthenticated()
    return await this.postJson('/getNetOfAmounts', { identityKey: this.identityKey, options })
  }

  async updateTransactionStatus (reference: string, status: DojoTransactionStatusApi): Promise<void> {
    this.verifyAuthenticated()
    await this.postJsonVoid('/updateTransactionStatus', { identityKey: this.identityKey, reference, status })
  }

  async getTransactions (options?: DojoGetTransactionsOptions): Promise<DojoGetTransactionsResultApi> {
    this.verifyAuthenticated()
    const results:{ txs: DojoTransactionApi[], total: number} = await this.postJson('/getTransactions', { identityKey: this.identityKey, options })
    for (const r of results.txs) {
      r.created_at = validateDate(r.created_at)
      r.updated_at = validateDate(r.updated_at)  
    }
    return results
  }

  async getPendingTransactions (referenceNumber?: string): Promise<DojoPendingTxApi[]> {
    this.verifyAuthenticated()
    const rs:DojoPendingTxApi[] = await this.postJson('/getPendingTransactions', { identityKey: this.identityKey, referenceNumber })
    return rs
  }

  async getEnvelopeForTransaction (txid: string): Promise<EnvelopeApi | undefined> {
    this.verifyAuthenticated()
    return await this.postJson('/getEnvelopeForTransaction', { identityKey: this.identityKey, txid })
  }

  async getTransactionOutputs (options?: DojoGetTransactionOutputsOptions): Promise<DojoGetTransactionOutputsResultApi> {
    this.verifyAuthenticated()
    const results: DojoGetTransactionOutputsResultApi = await this.postJson('/getTransactionOutputs', { identityKey: this.identityKey, options })
    for (const r of results.outputs) {
      r.created_at = validateDate(r.created_at)
      r.updated_at = validateDate(r.updated_at)  
      if (r.basket) {
        r.basket.created_at = validateDate(r.basket.created_at)
        r.basket.updated_at = validateDate(r.basket.updated_at)  
      }
      if (r.tags) {
        for (const t of r.tags) {
          t.created_at = validateDate(t.created_at)
          t.updated_at = validateDate(t.updated_at)  
        }
      }
    }
    return results
  }

  async getTransactionLabels(options?: DojoGetTransactionLabelsOptions): Promise<DojoGetTransactionLabelsResultApi> {
    this.verifyAuthenticated()
    const results:{ labels: DojoTxLabelApi[], total: number} = await this.postJson('/getTransactionLabels', { identityKey: this.identityKey, options })
    for (const r of results.labels) {
      r.created_at = validateDate(r.created_at)
      r.updated_at = validateDate(r.updated_at)  
      r.whenLastUsed = validateDate(r.whenLastUsed)
    }
    return results
  }

  async createTransaction (params: DojoCreateTransactionParams)
  : Promise<DojoCreateTransactionResultApi> {
    this.verifyAuthenticated()
    return await this.postJson('/createTransaction', { identityKey: this.identityKey, params })
  }

  async processTransaction (rawTx: string | Buffer, reference: string, outputMap: Record<string, number>): Promise<DojoProcessTransactionResultApi> {
    this.verifyAuthenticated()
    return await this.postJson('/processTransaction', { identityKey: this.identityKey, rawTx: asString(rawTx), reference, outputMap })
  }

  async submitDirectTransaction (params: DojoSubmitDirectTransactionParams)
  : Promise<DojoSubmitDirectTransactionResultApi> {
    this.verifyAuthenticated()
    return await this.postJson('/submitDirectTransaction', { identityKey: this.identityKey, params })
  }

  async copyState (): Promise<DojoUserStateApi> {
    this.verifyAuthenticated()
    const state = await this.postJson('/copyState', { identityKey: this.identityKey }) as DojoUserStateApi
    restoreUserStateEntities(state)
    return state
  }

  async getJsonOrUndefined<T>(path: string): Promise<T | undefined> {
    const r = await fetch(`${this.serviceUrl}${path}`)
    const v = await r.json() as FetchStatus<T>
    if (v.status === 'success') { return v.value }
    throw new ERR_BAD_REQUEST(`path=${path} status=${v.status}`)
  }

  async getJson<T>(path: string): Promise<T> {
    const r = await this.getJsonOrUndefined<T>(path)
    if (r === undefined) { throw new ERR_BAD_REQUEST(`path=${path}. Value was undefined. Requested object may not exist.`) }
    return r
  }

  async postJsonOrUndefined<T, R>(path: string, params: T, noAuth?: boolean): Promise<R | undefined> {
    let s: FetchStatus<R>
    try {
      if (this.authrite && !noAuth) {
        s = await this.authrite.createSignedRequest(path, params) as FetchStatus<R>
      } else {
        const headers = {}
        headers['Content-Type'] = 'application/json'
        const r = await fetch(`${this.serviceUrl}${path}`, {
          body: JSON.stringify(params),
          method: 'POST',
          headers
          // cache: 'no-cache',
        })
        s = await r.json() as FetchStatus<R>
      }
      if (s.status === 'success') { return s.value }
      throw new ERR_BAD_REQUEST(`path=${path} status=${s.status}`)
    } catch (eu: unknown) {
      const err = CwiError.fromUnknown(eu)
      err.description += `  <<path>> ${path}`
      // console.log(`Exception: ${JSON.stringify(err)}`)
      throw err
    }
  }

  async postJson<T, R>(path: string, params: T, noAuth?: boolean): Promise<R> {
    const r = await this.postJsonOrUndefined<T, R>(path, params, noAuth)
    if (r === undefined) { throw new ERR_BAD_REQUEST(`path=${path}. Value was undefined. Requested object may not exist.`) }
    return r
  }

  async postJsonVoid<T>(path: string, params: T, noAuth?: boolean): Promise<void> {
    await this.postJsonOrUndefined<T, void>(path, params, noAuth)
  }

  async softDeleteCertificate(partial: Partial<DojoCertificateApi>): Promise<number> {
    this.verifyAuthenticated()
    return await this.postJson('/softDeleteCertificate', { identityKey: this.identityKey, partial })
  }

  async softDeleteOutputTag(partial: Partial<DojoOutputTagApi>): Promise<number> {
    this.verifyAuthenticated()
    return await this.postJson('/softDeleteOutputTag', { identityKey: this.identityKey, partial })
  }

  async softDeleteTxLabel(partial: Partial<DojoTxLabelApi>): Promise<number> {
    this.verifyAuthenticated()
    return await this.postJson('/softDeleteTxLabel', { identityKey: this.identityKey, partial })
  }

  async softDeleteOutputBasket(partial: Partial<DojoOutputBasketApi>): Promise<number> {
    this.verifyAuthenticated()
    return await this.postJson('/softDeleteOutputBasket', { identityKey: this.identityKey, partial })
  }

  async labelTransaction(txid: string | number | Partial<DojoTransactionApi>, label: string): Promise<void> {
    this.verifyAuthenticated()
    return await this.postJson('/labelTransaction', { identityKey: this.identityKey, txid, label })
  }

  async unlabelTransaction(txid: string | number | Partial<DojoTransactionApi>, label: string): Promise<void> {
    this.verifyAuthenticated()
    return await this.postJson('/unlabelTransaction', { identityKey: this.identityKey, txid, label })
  }

  async tagOutput(partial: Partial<DojoOutputApi>, tag: string): Promise<void> {
    this.verifyAuthenticated()
    return await this.postJson('/tagOutput', { identityKey: this.identityKey, partial, tag })
  }

  async untagOutput(partial: Partial<DojoOutputApi>, tag: string): Promise<void> {
    this.verifyAuthenticated()
    return await this.postJson('/untagOutput', { identityKey: this.identityKey, partial, tag })
  }

  async unbasketOutput(partial: Partial<DojoOutputApi>, basket: string): Promise<void> {
    this.verifyAuthenticated()
    return await this.postJson('/unbasketOutput', { identityKey: this.identityKey, partial, basket })
  }
}
