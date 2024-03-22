import { DojoCreatingTxInstructionsApi, verifyTruthy } from "cwi-base";
import { LockingScript, P2PKH, ScriptTemplate, Transaction, UnlockingScript } from "@bsv/sdk";
import { invoice3241645161d8 } from "../invoice";
import { KeyPairApi } from "../Api/NinjaApi";
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

        // Derive the key used to unlock funds
        const derivedPrivateKey = getPaymentPrivateKey({
            recipientPrivateKey: keypair.privateKey,
            senderPublicKey: instructions.senderIdentityKey,
            invoiceNumber
        })

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

    unlock()
    : {
        sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>;
        estimateLength: (tx: Transaction, inputIndex: number) => Promise<number>;
    }
    {
        return {
            sign:
        }

    }

}