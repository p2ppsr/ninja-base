/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Chain } from "@cwi/base";
import { GetTransactionsOptions, TransactionApi, GetTotalOfAmountsOptions, TransactionStatusApi, CertificateApi } from "@cwi/dojo-base";
import { EnvelopeApi } from "@cwi/external-services";
import { NinjaApi } from "../Api/NinjaApi";

export class NinjaBase implements NinjaApi {
    
    constructor() {
        
    }
    
    getPaymail(): Promise<string> {
        throw new Error("Method not implemented.");
    }
    setPaymail(paymail: string): Promise<void> {
        throw new Error("Method not implemented.");
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
    getPendingTransactions(referenceNumber?: string | undefined): Promise<TransactionApi[]> {
        throw new Error("Method not implemented.");
    }
    getTotalOfAmounts(direction: "incoming" | "outgoing", options?: GetTotalOfAmountsOptions | undefined): Promise<number> {
        throw new Error("Method not implemented.");
    }
    getNetOfAmounts(options?: GetTotalOfAmountsOptions | undefined): Promise<number> {
        throw new Error("Method not implemented.");
    }
    getTotalValue(): Promise<number> {
        throw new Error("Method not implemented.");
    }
    getTransactionWithOutputs(outputs: { script: string; satoshis: number; }[], labels: string[], inputs: Record<string, EnvelopeApi>, note: string, recipient: string, autoProcess?: boolean | undefined, feePerKb?: number | undefined): Promise<void> {
        throw new Error("Method not implemented.");
    }
    createTransaction({ inputs, inputSelection, outputs, outputGeneration, fee, labels, note, recipient }: { inputs: any; inputSelection: any; outputs: any; outputGeneration: any; fee: any; labels: any; note: any; recipient: any; }): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getNetwork(format?: "default" | undefined): string {
        throw new Error("Method not implemented.");
    }
    getChain(): Chain {
        throw new Error("Method not implemented.");
    }
    processTransaction({ inputs, submittedTransaction, reference, outputMap }: { inputs: any; submittedTransaction: any; reference: any; outputMap: any; }): Promise<void> {
        throw new Error("Method not implemented.");
    }
    processPendingTransactions(onTransactionProcessed?: (() => void) | undefined, onTransactionFailed?: (() => void) | undefined): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getTransactionOutputs({ basket, tracked, includeEnvelope, spendable, type, limit, offset }: { basket: any; tracked: any; includeEnvelope?: boolean | undefined; spendable: any; type: any; limit?: number | undefined; offset?: number | undefined; }): Promise<void> {
        throw new Error("Method not implemented.");
    }
    updateTransactionStatus(reference: string, status: TransactionStatusApi): Promise<void> {
        throw new Error("Method not implemented.");
    }
    submitDirectTransaction({ protocol, transaction, senderIdentityKey, note, amount, labels, derivationPrefix }: { protocol: any; transaction: any; senderIdentityKey: any; note: any; amount: any; labels: any; derivationPrefix: any; }): Promise<string> {
        throw new Error("Method not implemented.");
    }
    verifyIncomingTransaction({ senderPaymail, senderIdentityKey, referenceNumber, description, amount }: { senderPaymail: any; senderIdentityKey: any; referenceNumber: any; description: any; amount: any; }): Promise<void> {
        throw new Error("Method not implemented.");
    }
    updateOutpointStatus(txid: string, vout: number, spendable: boolean): Promise<void> {
        throw new Error("Method not implemented.");
    }
    saveCertificate(certificate: CertificateApi): Promise<void> {
        throw new Error("Method not implemented.");
    }
    findCertificates(certifiers?: string[] | undefined, types?: string[] | undefined): Promise<CertificateApi[]> {
        throw new Error("Method not implemented.");
    }

}