/* eslint-disable @typescript-eslint/no-unused-vars */
import { AuthriteClient } from 'authrite-js'

import {
  Chain,
  ERR_INVALID_PARAMETER, ERR_MISSING_PARAMETER, ERR_BAD_REQUEST,
  asString, verifyTruthy, verifyId,
  DojoAvatarApi, DojoCertificateApi,
  DojoClientApi,
  DojoCreateTransactionResultApi,
  DojoGetTotalOfAmountsOptions,
  DojoGetTransactionOutputsOptions,
  DojoGetTransactionsOptions,
  DojoPendingTxApi,
  DojoProcessTransactionResultApi,
  DojoTransactionStatusApi,
  DojoSyncOptionsApi, SyncDojoConfigBaseApi, SyncDojoConfigCloudUrl,
  DojoTxLabelApi, DojoOutputApi, DojoTransactionApi,
  DojoGetTransactionLabelsOptions, DojoProcessTransactionParams, identityKeyFromPrivateKey, EnvelopeApi,
  DojoClientUserApi,
  ERR_NOT_IMPLEMENTED,
  DojoIdentityApi,
} from 'cwi-base'

import {
  KeyPairApi, NinjaApi,
  NinjaCreateTransactionParams, NinjaGetTransactionOutputsResultApi,
  NinjaGetTransactionWithOutputsParams, NinjaGetTransactionsResultApi,
  NinjaSignActionParams, NinjaSignActionResultApi,
  NinjaAbortActionParams, NinjaAbortActionResultApi, 
  NinjaSubmitDirectTransactionParams, NinjaSubmitDirectTransactionResultApi,
  NinjaTransactionFailedHandler, NinjaTransactionProcessedHandler,
  NinjaTransactionWithOutputsResultApi,
  NinjaGetTransactionsTxOutputApi,
  NinjaGetTransactionsTxInputApi,
  NinjaCreateActionParams,
  NinjaCreateActionResult,
} from '../Api/NinjaApi'

import { processPendingTransactions } from './processPendingTransactions'
import {
  getTransactionWithOutputs
} from './getTransactionWithOutputs'
import { createTransactionWithOutputs } from './createTransactionWithOutputs'
import { processTransactionWithOutputs } from './processTransactionWithOutputs'
import { submitDirectTransaction } from './submitDirectTransaction'
import { DojoExpressClient } from '../DojoExpressClient'
import { signAction } from './signAction'
import { abortAction } from './abortAction'
import { GetInfoParams, GetInfoResult, sdk } from '@babbage/sdk-ts'
import { ninjaProcessTransaction } from './ninjaProcessTransaction'
import { ninjaCreateAction } from './ninjaCreateAction'
import { createActionSdk, PendingSignAction } from './sdk/createActionSdk'
import { signActionSdk } from './sdk/signActionSdk'
import { internalizeActionSdk } from './sdk/internalizeActionSdk'
import { Transaction } from '@bsv/sdk'
import { relinquishOutputSdk } from './sdk/relinquishOutputSdk'

export class NinjaBase implements NinjaApi {
  chain?: Chain
  userId?: number
  user?: DojoClientUserApi
  _keyPair: KeyPairApi | undefined
  _isDojoAuthenticated: boolean
  dojoIdentity?: DojoIdentityApi
  pendingSignActions: Record<string, PendingSignAction>

  constructor (public dojo: DojoClientApi, clientPrivateKey?: string, public authrite?: AuthriteClient) {
    if (clientPrivateKey && authrite) throw new ERR_INVALID_PARAMETER('clientPrivateKey and authrite', 'only one provided')

    if (clientPrivateKey) {
      const identityPublicKey = identityKeyFromPrivateKey(clientPrivateKey)

      //console.log(`construct NinjaBase for identityKey ${identityPublicKey} from private key`)

      this._keyPair = {
        privateKey: clientPrivateKey,
        publicKey: identityPublicKey
      }
      
      if (dojo.isDojoExpressClient() && clientPrivateKey) {
        // Support delayed initialization of authrite with privateKey for use by DojoExpressClient to
        // communicate with DojoExpress.
        const dec = dojo as DojoExpressClient
        if (!dec.options.authrite || !dec.authrite) {
          const authrite = new AuthriteClient(dec.serviceUrl, { clientPrivateKey })
          dec.options.authrite = authrite
          dec.authrite = authrite
        }
      }
    } else if (authrite) {

      console.log(`construct NinjaBase for identityKey ${this.getClientChangeKeyPair().publicKey} from authrite`)

    } else {

      console.log(`construct NinjaBase without authentication`)

    }

    this._isDojoAuthenticated = false
    this.pendingSignActions = {}
  }

  getClientChangeKeyPair (): KeyPairApi {
    if (this._keyPair != null) { return this._keyPair }

    if (this.authrite) {
      const ac = this.authrite.authrite
      const r: KeyPairApi = {
        privateKey: ac.clientPrivateKey,
        publicKey: ac.clientPublicKey
      }
      return r
    }

    throw new ERR_BAD_REQUEST('Ninja constructed without clientPrivateKey or authrite.')
  }

  async authenticate (identityKey?: string, addIfNew?: boolean): Promise<void> {
    if (this._isDojoAuthenticated && identityKey) {
      const currentIdentity = this.getClientChangeKeyPair().publicKey
      if (currentIdentity !== identityKey)
        throw new ERR_BAD_REQUEST(`Attempted Ninja authenticate with identityKey ${identityKey} over ${currentIdentity}`)
    }

    identityKey ||= this.getClientChangeKeyPair().publicKey

    await this.dojo.authenticate(identityKey, addIfNew)
    this.user = await this.dojo.getUser()
    this.userId = verifyId(this.user.userId)
    this.dojoIdentity = await this.dojo.getDojoIdentity()
    this._isDojoAuthenticated = true

    //console.log(`NinjaBase authenticated as ${identityKey} ${this.userId}`)
  }

  isAuthenticated() : boolean {
    return !!this.user && this.userId !== undefined && this._isDojoAuthenticated
  }

  async verifyDojoAuthenticated () {
    if (!this._isDojoAuthenticated) {
      await this.authenticate(undefined, true)
    }
  }

  async sync(): Promise<void> {
    await this.verifyDojoAuthenticated()
    await this.dojo.sync()
  }

  async setSyncDojosByConfig(syncDojoConfigs: SyncDojoConfigBaseApi[], options?: DojoSyncOptionsApi | undefined): Promise<void> {
    await this.verifyDojoAuthenticated()
    const configs: SyncDojoConfigBaseApi[] = []
    for (const config of syncDojoConfigs) {
      switch (config.dojoType) {
        case 'MySql Connection': configs.push(config); break
        case 'Sqlite File': configs.push(config); break
        case 'Cloud URL':
          const c = config as SyncDojoConfigCloudUrl
          if (c.clientPrivateKey === 'true') {
            const c2 = {...c}
            c2.clientPrivateKey = this.getClientChangeKeyPair().privateKey
            configs.push(c2)
          } else {
            configs.push(config)
          }
          break
        default:
          throw new ERR_BAD_REQUEST(`dojoType ${config.dojoType} may not be set by 'setSyncDojosByConfig'`)
      }
    }
    await this.dojo.setSyncDojosByConfig(configs, options)
  }

  async getSyncDojosByConfig(): Promise<{ dojos: SyncDojoConfigBaseApi[]; options?: DojoSyncOptionsApi | undefined }> {
    await this.verifyDojoAuthenticated()
    const r = await this.dojo.getSyncDojosByConfig()
    return r
  }

  async getPaymail (): Promise<string> {
    await this.verifyDojoAuthenticated()
    const paymails = await this.dojo.getCurrentPaymails()
    return paymails[0]
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async setPaymail (paymail: string): Promise<void> {
    throw new Error('Obsolete API.')
  }

  async getChain (): Promise<Chain> {
    this.chain ||= await this.dojo.getChain()
    return verifyTruthy(this.chain)
  }

  async getNetwork (format?: 'default' | 'nonet'): Promise<string> {
    let chain: string = await this.getChain()
    if (format !== 'nonet') chain += 'net'
    return chain
  }

  async findCertificates (certifiers?: string[] | object, types?: Record<string, string[]>): Promise<{ status: 'success', certificates: DojoCertificateApi[] }> {
    await this.verifyDojoAuthenticated()
    if (certifiers && !Array.isArray(certifiers)) {
      // Named Object Parameter Destructuring pattern conversion...
      types = certifiers['types']
      certifiers = certifiers['certifiers']
    }
    if ((certifiers != null) && !Array.isArray(certifiers)) throw new ERR_INVALID_PARAMETER('certifiers')
    if ((types != null) && typeof types !== 'object') throw new ERR_INVALID_PARAMETER('types')
    const certs = await this.dojo.findCertificates(certifiers, types)
    return { status: 'success', certificates: certs }
  }

  async saveCertificate (certificate: DojoCertificateApi | object): Promise<void> {
    await this.verifyDojoAuthenticated()
    if (certificate && typeof certificate === 'object' && certificate['certificate']) {
      certificate = certificate['certificate']
    }
    const cert = certificate as DojoCertificateApi
    await this.dojo.saveCertificate(cert)
  }

  async getTotalValue (basket?: string): Promise<{ total: number }> {
    await this.verifyDojoAuthenticated()
    if (basket && typeof basket !== 'string') {
      basket = undefined
    }
    const total = await this.dojo.getTotalOfUnspentOutputs(basket || 'default')
    if (total === undefined) throw new ERR_MISSING_PARAMETER('basket', 'existing basket name')
    return {
      total
    }
  }

  async getTotalOfAmounts (options: DojoGetTotalOfAmountsOptions): Promise<{ total: number }> {
    await this.verifyDojoAuthenticated()
    const direction = options.direction
    if (!direction) throw new ERR_MISSING_PARAMETER('direction', 'incoming or outgoing')
    delete options.direction
    const total = await this.dojo.getTotalOfAmounts(direction, options)
    return { total }
  }

  async getNetOfAmounts (options?: DojoGetTotalOfAmountsOptions | undefined): Promise<number> {
    await this.verifyDojoAuthenticated()
    const total = await this.dojo.getNetOfAmounts(options)
    return total
  }

  async getAvatar (): Promise<DojoAvatarApi> {
    await this.verifyDojoAuthenticated()
    const a = await this.dojo.getAvatar()
    return a
  }

  async setAvatar (name: string, photoURL: string): Promise<void> {
    await this.verifyDojoAuthenticated()
    await this.dojo.setAvatar({ name, photoURL })
  }

  async updateTransactionStatus (params: { reference: string, status: DojoTransactionStatusApi }): Promise<void> {
    await this.verifyDojoAuthenticated()
    await this.dojo.updateTransactionStatus(params.reference, params.status)
  }

  async updateOutpointStatus (params: { txid: string, vout: number, spendable: boolean }): Promise<void> {
    await this.verifyDojoAuthenticated()
    await this.dojo.updateOutpointStatus(params.txid, params.vout, params.spendable)
  }

  async getTransactions (options?: DojoGetTransactionsOptions): Promise<NinjaGetTransactionsResultApi> {
    await this.verifyDojoAuthenticated()
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
        labels: t.labels || [],
        inputs: !t.inputs
          ? undefined
          : t.inputs.map(x => {
            const input: NinjaGetTransactionsTxInputApi = {
              txid: x.txid || '',
              vout: x.vout || 0,
              amount: x.amount || 0,
              outputScript: asString(x.outputScript || ''),
              type: x.type,
              spendable: x.spendable,
              spendingDescription: x.spendingDescription || undefined,
              basket: x.basket ? x.basket.name : undefined,
              tags: x.tags ? x.tags.map(t => t.tag) : undefined
            }
          return input
        }),
        outputs: !t.outputs
          ? undefined
          : t.outputs.map(x => {
            const output: NinjaGetTransactionsTxOutputApi = {
            txid: x.txid || '',
            vout: x.vout || 0,
            amount: x.amount || 0,
            outputScript: asString(x.outputScript || ''),
            type: x.type,
            spendable: x.spendable,
            description: x.description || undefined,
            basket: x.basket ? x.basket.name : undefined,
            tags: x.tags ? x.tags.map(t => t.tag) : undefined
          }
          return output
      })
    }))}
    return rr
  }

  async getPendingTransactions (referenceNumber?: string): Promise<DojoPendingTxApi[]> {
    await this.verifyDojoAuthenticated()
    const r = await this.dojo.getPendingTransactions(referenceNumber)
    return r
  }

  async processPendingTransactions (onTransactionProcessed?: NinjaTransactionProcessedHandler, onTransactionFailed?: NinjaTransactionFailedHandler): Promise<void> {
    await this.verifyDojoAuthenticated()
    await processPendingTransactions(this, onTransactionProcessed, onTransactionFailed)
  }


  async getTransactionOutputs (options?: DojoGetTransactionOutputsOptions)
  : Promise<NinjaGetTransactionOutputsResultApi[]> {
    await this.verifyDojoAuthenticated()
    const r = await this.dojo.getTransactionOutputs(options)
    const gtors: NinjaGetTransactionOutputsResultApi[] = r.outputs
      .filter(x => x.txid && typeof x.vout === 'number' && typeof x.amount === 'number' && x.outputScript)
      .map(x => ({
        txid: x.txid || '',
        vout: x.vout || 0,
        amount: x.amount || 0,
        outputScript: asString(x.outputScript || ''),
        type: x.type,
        purpose: x.purpose,
        spendable: x.spendable,
        envelope: x.envelope,
        customInstructions: options?.includeEnvelope || options?.includeCustomInstructions ? (x.customInstructions || undefined) : undefined,
        basket: x.basket ? x.basket.name : undefined,
        tags: x.tags ? x.tags.map(t => t.tag) : undefined
      }))
    return gtors
  }

  async getTransactionLabels(options?: DojoGetTransactionLabelsOptions): Promise<{ labels: DojoTxLabelApi[], total: number }> {
    await this.verifyDojoAuthenticated()
    const r = await this.dojo.getTransactionLabels(options)
    return r
  }

  async getEnvelopeForTransaction(txid: string): Promise<EnvelopeApi | undefined> {
    await this.verifyDojoAuthenticated()
    const r = await this.dojo.getEnvelopeForTransaction(txid)
    return r
  }

  async processTransaction (params: DojoProcessTransactionParams): Promise<DojoProcessTransactionResultApi> {
    await this.verifyDojoAuthenticated()
    const r = await ninjaProcessTransaction(this, params)
    return r
  }

  async createAction(params: NinjaCreateActionParams): Promise<NinjaCreateActionResult> {
    await this.verifyDojoAuthenticated()
    const r = await ninjaCreateAction(this, params)
    return r
  }

  async createActionSdk(vargs: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
  : Promise<sdk.CreateActionResult> {
    await this.verifyDojoAuthenticated()
    const r = await createActionSdk(this, vargs, originator)
    return r
  }

  async signActionSdk(vargs: sdk.ValidSignActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
  : Promise<sdk.SignActionResult> {
    await this.verifyDojoAuthenticated()
    const r = await signActionSdk(this, vargs, originator)
    return r
  }

  async abortActionSdk(vargs: sdk.ValidAbortActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
  : Promise<sdk.AbortActionResult> {
    await this.verifyDojoAuthenticated()
    const r = await this.dojo.abortActionSdk(vargs, originator)
    return r
  }

  async internalizeActionSdk(vargs: sdk.ValidInternalizeActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
  : Promise<sdk.InternalizeActionResult> {
    await this.verifyDojoAuthenticated()
    const r = await internalizeActionSdk(this, vargs, originator)
    return r
  }

  async relinquishOutputSdk(vargs: sdk.ValidRelinquishOutputArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
  : Promise<sdk.RelinquishOutputResult> {
    await this.verifyDojoAuthenticated()
    const r = await relinquishOutputSdk(this, vargs, originator)
    return r
  }

  async listActions(vargs: sdk.ValidListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes) : Promise<sdk.ListActionsResult> {
    await this.verifyDojoAuthenticated()
    const r = await this.dojo.listActions(vargs, originator)
    return r
  }

  async listOutputs(vargs: sdk.ValidListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes) : Promise<sdk.ListOutputsResult> {
    await this.verifyDojoAuthenticated()
    const r = await this.dojo.listOutputs(vargs, originator)
    return r
  }

  async getTransactionWithOutputs (params: NinjaGetTransactionWithOutputsParams): Promise<NinjaTransactionWithOutputsResultApi> {
    await this.verifyDojoAuthenticated()
    const r = await getTransactionWithOutputs(this, params)
    return r
  }

  async createTransactionWithOutputs (params: NinjaGetTransactionWithOutputsParams): Promise<NinjaTransactionWithOutputsResultApi> {
    await this.verifyDojoAuthenticated()
    const r = await createTransactionWithOutputs(this, params)
    return r
  }

  async processTransactionWithOutputs (params: NinjaGetTransactionWithOutputsParams): Promise<NinjaTransactionWithOutputsResultApi> {
    await this.verifyDojoAuthenticated()
    const r = await processTransactionWithOutputs(this, params)
    return r
  }

  async signAction(params: NinjaSignActionParams): Promise<NinjaSignActionResultApi> {
    await this.verifyDojoAuthenticated()
    const r = await signAction(this, params)
    return r
  }

  async abortAction(params: NinjaAbortActionParams): Promise<NinjaAbortActionResultApi> {
    await this.verifyDojoAuthenticated()
    const r = await abortAction(this, params)
    return r
  }

  async createTransaction(params: NinjaCreateTransactionParams): Promise<DojoCreateTransactionResultApi> {
    await this.verifyDojoAuthenticated()
    const r = await this.dojo.createTransaction(params)
    return r
  }

  async deleteCertificate(partial: Partial<DojoCertificateApi>): Promise<number> {
    await this.verifyDojoAuthenticated()
    const r = await this.dojo.softDeleteCertificate(partial)
    return r
  }

  async labelTransaction(txid: string | number | Partial<DojoTransactionApi>, label: string): Promise<void> {
    await this.verifyDojoAuthenticated()
    await this.dojo.labelTransaction(txid, label)
  }

  async unlabelTransaction(txid: string | number | Partial<DojoTransactionApi>, label: string): Promise<void> {
    await this.verifyDojoAuthenticated()
    await this.dojo.unlabelTransaction(txid, label)
  }

  async tagOutput(output: { txid: string, vout: number }, tag: string): Promise<void> {
    await this.verifyDojoAuthenticated()
    const partial: Partial<DojoOutputApi> = {
      txid: output.txid,
      vout: output.vout,
      userId: this.userId
    }
    await this.dojo.tagOutput(partial, tag)
  }

  async untagOutput(output: { txid: string, vout: number }, tag: string): Promise<void> {
    await this.verifyDojoAuthenticated()
    const partial: Partial<DojoOutputApi> = {
      txid: output.txid,
      vout: output.vout,
      userId: this.userId
    }
    await this.dojo.untagOutput(partial, tag)
  }
    
  async unbasketOutput(output: { txid: string, vout: number }): Promise<void> {
    await this.verifyDojoAuthenticated()
    const partial: Partial<DojoOutputApi> = {
      txid: output.txid,
      vout: output.vout,
      userId: this.userId
    }
    await this.dojo.unbasketOutput(partial)
  }

  async submitDirectTransaction (params: NinjaSubmitDirectTransactionParams): Promise<NinjaSubmitDirectTransactionResultApi> {
    await this.verifyDojoAuthenticated()
    const r = await submitDirectTransaction(this, params)
    return r
  }

  async getEnvelopesOfConflictingTransactions(txid: string): Promise<EnvelopeApi[]> {
    await this.verifyDojoAuthenticated()
    const r = await this.dojo.getEnvelopesOfConflictingTransactions(txid)
    return r
  }

  async getHeight(): Promise<number> {
    await this.verifyDojoAuthenticated()
    const r = await this.dojo.getHeight()
    return r
  }

  async getMerkleRootForHeight(height: number): Promise<string | undefined> {
    await this.verifyDojoAuthenticated()
    const r = await this.dojo.getMerkleRootForHeight(height)
    return r
  }

  async getHeaderForHeight(height: number): Promise<number[] | undefined> {
    await this.verifyDojoAuthenticated()
    const r = await this.dojo.getHeaderForHeight(height)
    return r
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getInfo(params: GetInfoParams): Promise<GetInfoResult> {
    await this.verifyDojoAuthenticated()

    const dojoIdent = await this.dojo.getDojoIdentity()

    const r: GetInfoResult = {
      metanetClientVersion: '',
      chain: await this.getChain(),
      height: await this.getHeight(),
      userId: verifyId(this.userId),
      userIdentityKey: this.user!.identityKey,
      dojoIdentityKey: dojoIdent.dojoIdentityKey,
      dojoIdentityName: dojoIdent.dojoName,
      perferredCurrency: ''
    }

    return r
  }

}
