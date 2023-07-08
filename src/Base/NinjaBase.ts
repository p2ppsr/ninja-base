/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Authrite } from "authrite-js"

import { Chain, ERR_INVALID_PARAMETER, ERR_MISSING_PARAMETER, asString } from "cwi-base";
import { GetTransactionsOptions, GetTotalOfAmountsOptions, TransactionStatusApi, CertificateApi, DojoApi, AvatarApi, PendingTxApi, GetTransactionOutputsOptions, ProcessTransactionResultApi, DojoTxInputsApi, TxInputSelectionApi, CreateTxOutputApi, OutputGenerationApi, FeeModelApi, GetTxWithOutputsProcessedResultApi, CreateTransactionResultApi } from "@cwi/dojo-base";
import { GetTransactionsResultApi, GetTxWithOutputsResultApi, GetTransactionOutputsResultApi, TransactionTemplateApi } from "@cwi/dojo-base";
import { KeyPairApi, NinjaApi, NinjaTransactionFailedHandler, NinjaTransactionProcessedHandler, NinjaTxInputsApi } from "../Api/NinjaApi";

import { processPendingTransactions } from "./processPendingTransactions";
import { getTransactionWithOutputs } from "./getTransactionWithOutputs";

export class NinjaBase implements NinjaApi {
    chain?: Chain
    authriteClient: Authrite

    constructor(public dojo: DojoApi, authriteClient: Authrite) {
        this.authriteClient = authriteClient
    }

    getClientChangeKeyPair(): KeyPairApi {
        const r: KeyPairApi = {
            privateKey: this.authriteClient.clientPrivateKey,
            publicKey: this.authriteClient.clientPublicKey            
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
        if (!this.chain) {
            this.chain = await this.dojo.getChain()
        }
        return this.chain
    }

    async getNetwork(format?: 'default' | 'nonet'): Promise<string> {
        let chain: string = await this.getChain()
        if (format !== 'nonet') chain += 'net'
        return chain
    }

    async findCertificates(certifiers?: string[] | object, types?: Record<string, string[]>): Promise<{ status: 'success', certificates: CertificateApi[] }> {
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

    async saveCertificate(certificate: CertificateApi | object): Promise<void> {
        if (certificate && typeof certificate === 'object' && certificate['certificate']) {
            certificate = certificate['certificate']
        }
        const cert = certificate as CertificateApi
        await this.dojo.saveCertificate(cert)
    }

    async getTotalValue(basket?: string): Promise<number> {
        const total = await this.dojo.getTotalOfUnspentOutputs(basket || 'default')
        if (total === undefined) throw new ERR_MISSING_PARAMETER('basket', 'existing basket name')
        return total
    }

    async getTotalOfAmounts(options: GetTotalOfAmountsOptions): Promise<number> {
        const direction = options.direction
        if (!direction) throw new ERR_MISSING_PARAMETER('direction', 'incoming or outgoing')
        delete options.direction
        const total = await this.dojo.getTotalOfAmounts(direction, options)
        return total
    }

    async getNetOfAmounts(options?: GetTotalOfAmountsOptions | undefined): Promise<number> {
        const total = await this.dojo.getNetOfAmounts(options)
        return total
    }
    
    async getAvatar(): Promise<AvatarApi> {
        const a = await this.dojo.getAvatar()
        return a
    }

    async setAvatar(name: string, photoURL: string): Promise<void> {
        await this.dojo.setAvatar({ name, photoURL })
    }

    async updateTransactionStatus(params: { reference: string, status: TransactionStatusApi }): Promise<void> {
        await this.dojo.updateTransactionStatus(params.reference, params.status)
    }
    
    async updateOutpointStatus(params: { txid: string, vout: number, spendable: boolean }): Promise<void> {
        await this.dojo.updateOutpointStatus(params.txid, params.vout, params.spendable)
    }

    async getTransactions(options?: GetTransactionsOptions): Promise<GetTransactionsResultApi> {
        const r = await this.dojo.getTransactions(options)
        const rr: GetTransactionsResultApi = {
            totalTransactions: r.total,
            transactions: r.txs.map(t => ({
                txid: t.txid,
                amount: t.amount,
                status: t.status,
                senderPaymail: t.senderPaymail || '',
                recipientPaymail: t.recipientPaymail || '',
                isOutgoing: t.isOutgoing,
                note: t.note || '',
                created_at: t.created_at?.toISOString() || '',
                referenceNumber: t.referenceNumber || '',
                labels: t.labels || []
            }))
        }
        return rr
    }

    async getPendingTransactions(referenceNumber?: string): Promise<PendingTxApi[]> {
        const r = await this.dojo.getPendingTransactions(referenceNumber)
        return r
    }

    async processPendingTransactions(onTransactionProcessed?: NinjaTransactionProcessedHandler, onTransactionFailed?: NinjaTransactionFailedHandler): Promise<void> {
        await processPendingTransactions(this.dojo, this.authriteClient, onTransactionProcessed, onTransactionFailed)
    }

    async getTransactionOutputs(options?: GetTransactionOutputsOptions): Promise<GetTransactionOutputsResultApi[]> {
        const r = await this.dojo.getTransactionOutputs(options)
        const gtors: GetTransactionOutputsResultApi[] = r.outputs
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
    }): Promise<ProcessTransactionResultApi> {
        const r = await this.dojo.processTransaction(params.submittedTransaction, params.reference, params.outputMap)
        return r
    }
    
    async getTransactionWithOutputs(params: {
        outputs: CreateTxOutputApi[],
        labels: string[],
        inputs: Record<string, NinjaTxInputsApi>,
        note: string,
        recipient: string,
        autoProcess?: boolean | undefined,
        feePerKb?: number | undefined
    }): Promise<GetTxWithOutputsResultApi | GetTxWithOutputsProcessedResultApi> {
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
    
    async createTransaction(params: {
        inputs: Record<string, DojoTxInputsApi>,
        inputSelection: TxInputSelectionApi,
        outputs: CreateTxOutputApi[],
        outputGeneration: OutputGenerationApi,
        fee: FeeModelApi,
        labels: string[],
        note?: string,
        recipient?: string
    }): Promise<CreateTransactionResultApi> {
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


    submitDirectTransaction(params: {
        protocol, transaction, senderIdentityKey, note, amount, labels, derivationPrefix
    }: 
    {
        protocol: any; transaction: any; senderIdentityKey: any; note: any; amount: any; labels: any; derivationPrefix: any; 
    }): Promise<string> {
        throw new Error("Method not implemented.");
    }

    verifyIncomingTransaction({ senderPaymail, senderIdentityKey, referenceNumber, description, amount }: { senderPaymail: any; senderIdentityKey: any; referenceNumber: any; description: any; amount: any; }): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}
