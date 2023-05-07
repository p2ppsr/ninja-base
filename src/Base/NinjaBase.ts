/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Chain, ERR_INVALID_PARAMETER, ERR_MISSING_PARAMETER } from "@cwi/base";
import { GetTransactionsOptions, TransactionApi, GetTotalOfAmountsOptions, TransactionStatusApi, CertificateApi, DojoApi, DojoUserStateApi } from "@cwi/dojo-base";
import { EnvelopeApi } from "@cwi/external-services";
import { GetPendingTransactionsTxApi, GetTxWithOutputsResultApi, TransactionOutputDescriptorApi, TransactionTemplateApi } from "../Api/NinjaEntitiesApi";
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

    getAvatar(): Promise<{ name: string; photoURL: string; }> {
        throw new Error("Method not implemented.");
    }
    setAvatar(name: string, photoURL: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getTransactions(options?: GetTransactionsOptions | undefined): Promise<{ txs: TransactionApi[]; total: number; }> {
        throw new Error("Method not implemented.");
    }
    getPendingTransactions(referenceNumber?: string | undefined): Promise<GetPendingTransactionsTxApi[]> {
        throw new Error("Method not implemented.");
    }
    getTotalOfAmounts(direction: "incoming" | "outgoing", options?: GetTotalOfAmountsOptions | undefined): Promise<number> {
        throw new Error("Method not implemented.");
    }
    getNetOfAmounts(options?: GetTotalOfAmountsOptions | undefined): Promise<number> {
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
    updateTransactionStatus(reference: string, status: TransactionStatusApi): Promise<void> {
        throw new Error("Method not implemented.");
    }
    submitDirectTransaction({ protocol, transaction, senderIdentityKey, note, amount, labels, derivationPrefix }: { protocol: any; transaction: any; senderIdentityKey: any; note: any; amount: any; labels: any; derivationPrefix: any; }): Promise<string> {
        throw new Error("Method not implemented.");
    }
    verifyIncomingTransaction({ senderPaymail, senderIdentityKey, referenceNumber, description, amount }: { senderPaymail: any; senderIdentityKey: any; referenceNumber: any; description: any; amount: any; }): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    updateOutpointStatus(txid: string, vout: number, spendable: boolean): Promise<void> {
        throw new Error("Method not implemented.");
    }

}