import { DojoCreatingTxInstructionsApi, asBsvSdkPrivateKey, verifyTruthy } from "cwi-base";
import { LockingScript, P2PKH, ScriptTemplate, Transaction, UnlockingScript } from "@bsv/sdk";
import { invoice3241645161d8 } from "../invoice";
import { getPaymentAddress, getPaymentPrivateKey } from "sendover";

export class NinjaUnlockTemplateSABPPP implements ScriptTemplate {
    p2pkh: P2PKH
    invoiceNumber: string

    constructor(public instructions: DojoCreatingTxInstructionsApi) {
        this.p2pkh = new P2PKH()

        const paymailHandle = instructions.paymailHandle
        const derivationPrefix = verifyTruthy(instructions.derivationPrefix)
        const derivationSuffix = verifyTruthy(instructions.derivationSuffix)

        this.invoiceNumber = invoice3241645161d8(derivationPrefix, derivationSuffix, paymailHandle)

    }

    lock(lockerPrivKey: string, unlockerPubKey: string) : LockingScript {
        const derivedAddress = getPaymentAddress({
            senderPrivateKey: lockerPrivKey,
            recipientPublicKey: unlockerPubKey,
            invoiceNumber: this.invoiceNumber,
            returnType: 'address'
        }) as string
        const r = this.p2pkh.lock(derivedAddress)
        return r
    } 

    unlock(unlockerPrivKey: string, lockerPubKey: string)
    : {
        sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>;
        estimateLength: (tx: Transaction, inputIndex: number) => Promise<number>;
    }
    {
        // Derive the key used to unlock funds
        const derivedPrivateKey = getPaymentPrivateKey({
            recipientPrivateKey: unlockerPrivKey,
            senderPublicKey: lockerPubKey,
            invoiceNumber: this.invoiceNumber
        })
        const r = this.p2pkh.unlock(asBsvSdkPrivateKey(derivedPrivateKey), "all", false)
        return r
    }

}