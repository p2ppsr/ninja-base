/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { AuthriteClient } from 'authrite-js'

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
  ERR_INVALID_PARAMETER, ERR_MISSING_PARAMETER, asString, verifyTruthy, ERR_BAD_REQUEST, DojoSyncOptionsApi, SyncDojoConfigBaseApi, SyncDojoConfigCloudUrl, DojoOutputTagApi, DojoTxLabelApi, DojoOutputApi, DojoOutputBasketApi, verifyId, DojoTransactionApi, DojoGetTransactionLabelsOptions,
} from 'cwi-base'

import {
  KeyPairApi, NinjaApi, NinjaCreateTransactionParams, NinjaGetTransactionOutputsResultApi, NinjaGetTransactionsResultApi, NinjaGetTxWithOutputsProcessedResultApi, NinjaGetTxWithOutputsResultApi, NinjaSubmitDirectTransactionParams, NinjaSubmitDirectTransactionResultApi, NinjaTransactionFailedHandler, NinjaTransactionProcessedHandler,
  NinjaTxInputsApi
} from '../Api/NinjaApi'

import { processPendingTransactions } from './processPendingTransactions'
import { getTransactionWithOutputs } from './getTransactionWithOutputs'
import { submitDirectTransaction } from './submitDirectTransaction'

export class NinjaBase implements NinjaApi {
  chain?: Chain
  userId?: number
  _keyPair: KeyPairApi | undefined
  _isDojoAuthenticated: boolean

  constructor (public dojo: DojoClientApi, clientPrivateKey?: string, public authrite?: AuthriteClient) {
    if (clientPrivateKey && authrite) throw new ERR_INVALID_PARAMETER('clientPrivateKey and authrite', 'only one provided')

    if (clientPrivateKey) {
      const privKey = new bsv.PrivKey(new bsv.Bn(clientPrivateKey, 'hex'), true)
      const identityPublicKey = bsv.PubKey.fromPrivKey(privKey).toDer(true).toString('hex')
      this._keyPair = {
        privateKey: clientPrivateKey,
        publicKey: identityPublicKey
      }
    }

    this._isDojoAuthenticated = false
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
    identityKey ||= this.getClientChangeKeyPair().publicKey

    await this.dojo.authenticate(identityKey, addIfNew)
    const user = await this.dojo.getUser()
    this.userId = verifyId(user.userId)
    this._isDojoAuthenticated = true
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
        inputs: t.inputs ? t.inputs.map(x => ({
          txid: x.txid || '',
          vout: x.vout || 0,
          amount: x.amount || 0,
          outputScript: asString(x.outputScript || ''),
          type: x.type,
          spendable: x.spendable,
          spendingDescription: x.spendingDescription || undefined,
          basket: x.basket ? x.basket.name : undefined,
          tags: x.tags ? x.tags.map(t => t.tag) : undefined
        })) : undefined,
        outputs: t.outputs ? t.outputs.map(x => ({
          txid: x.txid || '',
          vout: x.vout || 0,
          amount: x.amount || 0,
          outputScript: asString(x.outputScript || ''),
          type: x.type,
          spendable: x.spendable,
          description: x.description || undefined,
          basket: x.basket ? x.basket.name : undefined,
          tags: x.tags ? x.tags.map(t => t.tag) : undefined
        })) : undefined
      }))
    }
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

  async getTransactionOutputs (options?: DojoGetTransactionOutputsOptions): Promise<NinjaGetTransactionOutputsResultApi[]> {
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
        customInstructions: options?.includeEnvelope ? (x.customInstructions || undefined) : undefined,
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

  async processTransaction (params: {
    submittedTransaction: string | Buffer
    reference: string
    outputMap: Record<string, number>
  }): Promise<DojoProcessTransactionResultApi> {
    await this.verifyDojoAuthenticated()
    const r = await this.dojo.processTransaction(params.submittedTransaction, params.reference, params.outputMap)
    return r
  }

  async getTransactionWithOutputs (params: {
    outputs: DojoCreateTxOutputApi[]
    labels?: string[]
    inputs?: Record<string, NinjaTxInputsApi>
    note?: string
    recipient?: string
    autoProcess?: boolean | undefined
    feePerKb?: number | undefined
  }): Promise<NinjaGetTxWithOutputsResultApi | NinjaGetTxWithOutputsProcessedResultApi> {
    await this.verifyDojoAuthenticated()
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

  async createTransaction (params: NinjaCreateTransactionParams): Promise<DojoCreateTransactionResultApi> {
    await this.verifyDojoAuthenticated()
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

  async tagOutput(partial: Partial<DojoOutputApi>, tag: string): Promise<void> {
    await this.verifyDojoAuthenticated()
    await this.dojo.tagOutput(partial, tag)
  }

  async untagOutput(partial: Partial<DojoOutputApi>, tag: string): Promise<void> {
    await this.verifyDojoAuthenticated()
    await this.dojo.untagOutput(partial, tag)
  }
    
  async defenestrateOutput(partial: Partial<DojoOutputApi>): Promise<void> {
    await this.unbasketOutput(partial)
  }

  async unbasketOutput(partial: Partial<DojoOutputApi>): Promise<void> {
    await this.verifyDojoAuthenticated()
    await this.dojo.unbasketOutput(partial)
  }

  async submitDirectTransaction (params: NinjaSubmitDirectTransactionParams): Promise<NinjaSubmitDirectTransactionResultApi> {
    await this.verifyDojoAuthenticated()
    
    const r = await submitDirectTransaction(this, params)
    
    return r
  }
}
