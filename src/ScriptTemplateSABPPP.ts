import { asBsvSdkPrivateKey, verifyTruthy } from "cwi-base";
import { LockingScript, P2PKH, Script, ScriptTemplate, Transaction, UnlockingScript } from "@bsv/sdk";
import { getPaymentAddress, getPaymentPrivateKey } from "sendover";

export interface ScriptTemplateParamsSABPPP {
   derivationPrefix?: string
   derivationSuffix?: string
}

export class ScriptTemplateSABPPP implements ScriptTemplate {
    p2pkh: P2PKH

    protocol: string = '2-3241645161d8'

    constructor(public params: ScriptTemplateParamsSABPPP) {
        this.p2pkh = new P2PKH()

        verifyTruthy(params.derivationPrefix)
        verifyTruthy(params.derivationSuffix)
    }

    /**
     * Combine inputs per protocol 3241645161d8 to generate an 'invoice' string used for cryptographic key generation.
     */
    invoice (): string {
        const invoice = `${this.protocol}-${this.params.derivationPrefix} ${this.params.derivationSuffix}`
        return invoice
    }

    lock(lockerPrivKey: string, unlockerPubKey: string) : LockingScript {
        const derivedAddress = getPaymentAddress({
            senderPrivateKey: lockerPrivKey,
            recipientPublicKey: unlockerPubKey,
            invoiceNumber: this.invoice(),
            returnType: 'address'
        }) as string
        const r = this.p2pkh.lock(derivedAddress)
        return r
    } 

    unlock(unlockerPrivKey: string, lockerPubKey: string, sourceSatoshis?: number, lockingScript?: Script)
    : {
        sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>;
        estimateLength: (tx: Transaction, inputIndex: number) => Promise<number>;
    }
    {
        // Derive the key used to unlock funds
        const derivedPrivateKey = getPaymentPrivateKey({
            recipientPrivateKey: unlockerPrivKey,
            senderPublicKey: lockerPubKey,
            invoiceNumber: this.invoice(),
            returnType: "hex"
        })
        
        const r = this.p2pkh.unlock(asBsvSdkPrivateKey(derivedPrivateKey), "all", false, sourceSatoshis, lockingScript)
        return r
    }

}