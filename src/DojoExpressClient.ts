/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Chain, DojoAvatarApi, DojoCertificateApi, DojoClientApi, DojoClientUserApi, DojoCreateTransactionResultApi,
  DojoGetTotalOfAmountsOptions, DojoGetTransactionOutputsOptions,
  DojoGetTransactionsOptions, DojoOutputApi, DojoPendingTxApi, DojoStatsApi,
  DojoSubmitDirectTransactionResultApi, DojoTransactionApi, DojoTransactionStatusApi,
  ERR_CHAIN, ERR_INTERNAL, ERR_UNAUTHORIZED, EnvelopeApi,
  DojoProcessTransactionResultApi, ERR_INVALID_PARAMETER, asString, DojoUserStateApi,
  CwiError, ERR_BAD_REQUEST, DojoSyncApi, DojoSyncOptionsApi, DojoSyncIdentifyParams, DojoSyncIdentifyResultApi,
  DojoSyncUpdateParams, DojoSyncUpdateResultApi, DojoSyncMergeParams, DojoSyncMergeResultApi,
  restoreUserStateEntities, DojoIdentityApi, SyncDojoConfigBaseApi, validateDate, DojoGetTransactionLabelsOptions,
  DojoTxLabelApi, DojoOutputTagApi, DojoOutputBasketApi, DojoGetTransactionOutputsResultApi, DojoGetTransactionsResultApi,
  DojoGetTransactionLabelsResultApi, DojoSubmitDirectTransactionParams, DojoCreateTransactionParams,
  DojoProcessTransactionParams, verifyBufferOrObjectOrNull,
  DojoGetBeefOptions,
  DojoProcessActionSdkParams,
  DojoProcessActionSdkResults,
  DojoCreateTransactionSdkResult,
  DojoInternalizeActionArgs,
  DojoListCertificatesResult,
  DojoWalletCertificate,
} from 'cwi-base'

import { AuthriteClient } from 'authrite-js'

import fetch from 'node-fetch'
import { stampLog } from 'cwi-base'
import { sdk, Beef } from '@babbage/sdk-ts'

interface FetchStatus<T> {
  status: 'success' | 'error'
  error?: string,
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

  isDojoExpressClient(): boolean {
    return true
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
    if (!dojos || dojos.length === 0) return
    throw new ERR_BAD_REQUEST('DojoExpressClient does not support setSyncDojos.')
  }

  getSyncDojos (): { dojos: DojoSyncApi[], options: DojoSyncOptionsApi } {
    return { dojos: [], options: {} }
  }

  async setSyncDojosByConfig(syncDojoConfigs: SyncDojoConfigBaseApi[], options?: DojoSyncOptionsApi | undefined): Promise<void> {
    if (!syncDojoConfigs || syncDojoConfigs.length === 0) return
    throw new ERR_BAD_REQUEST('DojoExpressClient does not support setSyncDojosByConfig.')
  }

  async getSyncDojosByConfig(): Promise<{ dojos: SyncDojoConfigBaseApi[]; options?: DojoSyncOptionsApi | undefined }> {
    return { dojos: [], options: {} }
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
    const rs:DojoCertificateApi[] = await this.postJson('/findCertificates', { identityKey: this.identityKey, certifiers, types })
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
      r.rawTransaction = verifyBufferOrObjectOrNull(r.rawTransaction)
      r.beef = verifyBufferOrObjectOrNull(r.beef)
    }
    return results
  }

  async getPendingTransactions (referenceNumber?: string): Promise<DojoPendingTxApi[]> {
    this.verifyAuthenticated()
    const rs:DojoPendingTxApi[] = await this.postJson('/getPendingTransactions', { identityKey: this.identityKey, referenceNumber })
    return rs
  }

  async getBeefForTransaction(txid: string, options?: DojoGetBeefOptions): Promise<Beef> {
    this.verifyAuthenticated()
    // If options contains mergeToBeef, convert to serialized value if
    const o: DojoGetBeefOptions = { ...(options || {}) }
    let mergeToBeef = o.mergeToBeef
    o.mergeToBeef = undefined
    const beefBytes: number[] = await this.postJson('/getBeefForTransaction', { identityKey: this.identityKey, txid, options: o })
    let r = Beef.fromBinary(beefBytes)
    if (mergeToBeef) {
      if (Array.isArray(mergeToBeef)) mergeToBeef = Beef.fromBinary(mergeToBeef);
      mergeToBeef.mergeBeef(r)
      r = mergeToBeef
    }
    return r
  }

  async getEnvelopeForTransaction (txid: string): Promise<EnvelopeApi | undefined> {
    this.verifyAuthenticated()
    return await this.postJson('/getEnvelopeForTransaction', { identityKey: this.identityKey, txid })
  }

  async getEnvelopesOfConflictingTransactions(txid: string): Promise<EnvelopeApi[]> {
    this.verifyAuthenticated()
    return await this.postJson('/getEnvelopesOfConflictingTransactions', { identityKey: this.identityKey, txid })
  }

  async getTransactionOutputs (options?: DojoGetTransactionOutputsOptions): Promise<DojoGetTransactionOutputsResultApi> {
    this.verifyAuthenticated()
    const results: DojoGetTransactionOutputsResultApi = await this.postJson('/getTransactionOutputs', { identityKey: this.identityKey, options })
    for (const r of results.outputs) {
      r.created_at = validateDate(r.created_at)
      r.updated_at = validateDate(r.updated_at)  
      r.outputScript = verifyBufferOrObjectOrNull(r.outputScript)
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
    if (results.beef) {
      
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

  async currentHeight() : Promise<number> {
    return await this.getHeight()
  }
  async isValidRootForHeight(root: string, height: number) : Promise<boolean> {
    this.verifyAuthenticated()
    const r: boolean = await this.postJson('/isValidRootForHeight', { identityKey: this.identityKey, root, height })
    return r
  }
  async listActionsSdk(args: sdk.ValidListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes) : Promise<sdk.ListActionsResult> {
    this.verifyAuthenticated()
    const r: sdk.ListActionsResult = await this.postJson('/listActionsSdk', { identityKey: this.identityKey, args, originator })
    return r
  }
  async listOutputsSdk(args: sdk.ValidListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes) : Promise<sdk.ListOutputsResult> {
    this.verifyAuthenticated()
    const r: sdk.ListOutputsResult = await this.postJson('/listOutputsSdk', { identityKey: this.identityKey, args, originator })
    return r
  }
  async listCertificatesSdk(args: sdk.ValidListCertificatesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes) : Promise<DojoListCertificatesResult> {
    this.verifyAuthenticated()
    const r: DojoListCertificatesResult = await this.postJson('/listCertificatesSdk', { identityKey: this.identityKey, args, originator })
    return r
  }
  async proveCertificatesSdk(args: sdk.ValidProveCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes) : Promise<DojoWalletCertificate> {
    this.verifyAuthenticated()
    const r: DojoWalletCertificate = await this.postJson('/proveCertificateSdk', { identityKey: this.identityKey, args, originator })
    return r
  }
  async relinquishCertificateSdk(args: sdk.ValidRelinquishCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes) : Promise<sdk.RelinquishCertificateResult> {
    this.verifyAuthenticated()
    const r: sdk.RelinquishCertificateResult = await this.postJson('/relinquishCertificateSdk', { identityKey: this.identityKey, args, originator })
    return r
  }
  async discoverByIdentityKeySdk(args: sdk.ValidDiscoverByIdentityKeyArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes) : Promise<sdk.DiscoverCertificatesResult> {
    this.verifyAuthenticated()
    const r: sdk.DiscoverCertificatesResult = await this.postJson('/discoverByIdentityKeySdk', { identityKey: this.identityKey, args, originator })
    return r
  }
  async discoverByAttributesSdk(args: sdk.ValidDiscoverByAttributesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes) : Promise<sdk.DiscoverCertificatesResult> {
    this.verifyAuthenticated()
    const r: sdk.DiscoverCertificatesResult = await this.postJson('/discoverByAttributesSdk', { identityKey: this.identityKey, args, originator })
    return r
  }
  async acquireCertificateSdk(args: sdk.ValidAcquireDirectCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes) : Promise<sdk.AcquireCertificateResult> {
    this.verifyAuthenticated()
    const r: sdk.AcquireCertificateResult = await this.postJson('/aquireCertificateSdk', { identityKey: this.identityKey, args, originator })
    return r
  }
  async internalizeActionSdk(args: DojoInternalizeActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
  : Promise<sdk.InternalizeActionResult>
  {
    this.verifyAuthenticated()
    const r = <sdk.InternalizeActionResult>await this.postJson('/internalizeActionSdk', { identityKey: this.identityKey, args, originator })
    return r
  }
  async createTransactionSdk(args: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
  : Promise<DojoCreateTransactionSdkResult>
  {
    this.verifyAuthenticated()
    const r = <DojoCreateTransactionSdkResult>await this.postJson('/createTransactionSdk', { identityKey: this.identityKey, args, originator })
    return r
  }
  async processActionSdk(params: DojoProcessActionSdkParams, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<DojoProcessActionSdkResults> {
    this.verifyAuthenticated()
    const r = <DojoProcessActionSdkResults>await this.postJson('/processActionSdk', { identityKey: this.identityKey, params, originator })
    return r
  }
  async abortActionSdk(vargs: sdk.ValidAbortActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.AbortActionResult> {
    this.verifyAuthenticated()
    const r = <sdk.AbortActionResult>await this.postJson('/abortActionSdk', { identityKey: this.identityKey, vargs, originator })
    return r
  }
  async relinquishOutputSdk(vargs: sdk.ValidRelinquishOutputArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.RelinquishOutputResult> {
    this.verifyAuthenticated()
    const r = <sdk.RelinquishOutputResult>await this.postJson('/relinquishOutputSdk', { identityKey: this.identityKey, vargs, originator })
    return r
  }

  async createTransaction (params: DojoCreateTransactionParams)
  : Promise<DojoCreateTransactionResultApi> {
    this.verifyAuthenticated()
    const params2 = {
      ...params,
      beef: Array.isArray(params.beef) ? params.beef : params.beef ? params.beef.toBinary() : undefined,
    }
    params2.log = stampLog(params.log, 'start dojo client createTransaction')
    const r = <DojoCreateTransactionResultApi>await this.postJson('/createTransaction', { identityKey: this.identityKey, params: params2 })
    r.log = stampLog(r.log, 'end dojo client createTransaction **NETWORK**')
    return r
  }

  async processTransaction (params: DojoProcessTransactionParams): Promise<DojoProcessTransactionResultApi> {
    this.verifyAuthenticated()
    params.log = stampLog(params.log, 'start dojo client createTransaction')
    if (params.submittedTransaction) params.submittedTransaction = asString(params.submittedTransaction)
    const r = <DojoProcessTransactionResultApi>await this.postJson('/processTransaction', { identityKey: this.identityKey, params })
    r.log = stampLog(r.log, 'end dojo client processTransaction **NETWORK**')
    return r
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

  handleError<T>(s: FetchStatus<T>, path: string) : void {
    if (s.status === 'success' && s.error) {
      const e = CwiError.fromUnknown(JSON.parse(s.error))
      throw e
    } else {
      const e = new CwiError(s.code || 'ERR_BAD_REQUEST', s.description || `path=${path} status=${s.status}`)
      throw e
    }
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
    } catch (eu: unknown) {
      const err = CwiError.fromUnknown(eu)
      err.description += `  <<path>> ${path}`
      throw err
    }

    if (s.status === 'success' && !s.error) {
      return s.value
    }

    this.handleError(s, path)
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
    await this.postJsonVoid('/labelTransaction', { identityKey: this.identityKey, txid, label })
  }

  async unlabelTransaction(txid: string | number | Partial<DojoTransactionApi>, label: string): Promise<void> {
    this.verifyAuthenticated()
    await this.postJsonVoid('/unlabelTransaction', { identityKey: this.identityKey, txid, label })
  }

  async tagOutput(partial: Partial<DojoOutputApi>, tag: string): Promise<void> {
    this.verifyAuthenticated()
    await this.postJsonVoid('/tagOutput', { identityKey: this.identityKey, partial, tag })
  }

  async untagOutput(partial: Partial<DojoOutputApi>, tag: string): Promise<void> {
    this.verifyAuthenticated()
    await this.postJsonVoid('/untagOutput', { identityKey: this.identityKey, partial, tag })
  }

  async unbasketOutput(partial: Partial<DojoOutputApi>): Promise<void> {
    this.verifyAuthenticated()
    await this.postJsonVoid('/unbasketOutput', { identityKey: this.identityKey, partial })
  }

  async getHeight(): Promise<number> {
    this.verifyAuthenticated()
    return await this.postJson('/getHeight', { identityKey: this.identityKey })
  }

  async getMerkleRootForHeight(height: number): Promise<string | undefined> {
    this.verifyAuthenticated()
    return await this.postJsonOrUndefined('/getMerkleRootForHeight', { identityKey: this.identityKey, height })
  }

  async getHeaderForHeight(height: number): Promise<number[] | undefined> {
    this.verifyAuthenticated()
    return await this.postJsonOrUndefined('/getHeaderForHeight', { identityKey: this.identityKey, height })
  }
}
