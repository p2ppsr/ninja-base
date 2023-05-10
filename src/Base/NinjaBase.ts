/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Chain, ERR_INVALID_PARAMETER, ERR_MISSING_PARAMETER } from "cwi-base";
import { GetTransactionsOptions, TransactionApi, GetTotalOfAmountsOptions, TransactionStatusApi, CertificateApi, DojoApi, DojoUserStateApi, AvatarApi } from "@cwi/dojo-base";
import { EnvelopeApi } from "cwi-external-services";
import { GetPendingTransactionsTxApi, GetTransactionsResultApi, GetTxWithOutputsResultApi, TransactionOutputDescriptorApi, TransactionTemplateApi } from "../Api/NinjaEntitiesApi";
import { NinjaApi } from "../Api/NinjaApi";

export class NinjaBase implements NinjaApi {
    chain?: Chain

    constructor(public dojo: DojoApi) {
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
                senderPaymail: t.senderPaymail,
                recipientPaymail: t.recipientPaymail,
                isOutgoing: t.isOutgoing,
                note: t.note,
                created_at: t.created_at || '',
                referenceNumber: t.referenceNumber,
                labels: t.labels || []
            }))
        }
        return rr
    }

    getPendingTransactions(referenceNumber?: string | undefined): Promise<GetPendingTransactionsTxApi[]> {
        throw new Error("Method not implemented.");
    }
    getTransactionWithOutputs(outputs: { script: string; satoshis: number; }[], labels: string[], inputs: Record<string, EnvelopeApi>, note: string, recipient: string, autoProcess?: boolean | undefined, feePerKb?: number | undefined): Promise<GetTxWithOutputsResultApi> {
        throw new Error("Method not implemented.");
    }
    createTransaction({ inputs, inputSelection, outputs, outputGeneration, fee, labels, note, recipient }: { inputs: any; inputSelection: any; outputs: any; outputGeneration: any; fee: any; labels: any; note: any; recipient: any; }): Promise<TransactionTemplateApi> {
        throw new Error("Method not implemented.");
    }
    processTransaction({ inputs, submittedTransaction, reference, outputMap }: { inputs: any; submittedTransaction: any; reference: any; outputMap: any; }): Promise<void> {
        throw new Error("Method not implemented.");
    }
    processPendingTransactions(onTransactionProcessed?: (() => void) | undefined, onTransactionFailed?: (() => void) | undefined): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getTransactionOutputs({ basket, tracked, includeEnvelope, spendable, type, limit, offset }: { basket: any; tracked: any; includeEnvelope?: boolean | undefined; spendable: any; type: any; limit?: number | undefined; offset?: number | undefined; }): Promise<TransactionOutputDescriptorApi> {
        throw new Error("Method not implemented.");
    }
    submitDirectTransaction({ protocol, transaction, senderIdentityKey, note, amount, labels, derivationPrefix }: { protocol: any; transaction: any; senderIdentityKey: any; note: any; amount: any; labels: any; derivationPrefix: any; }): Promise<string> {
        throw new Error("Method not implemented.");
    }
    verifyIncomingTransaction({ senderPaymail, senderIdentityKey, referenceNumber, description, amount }: { senderPaymail: any; senderIdentityKey: any; referenceNumber: any; description: any; amount: any; }): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}