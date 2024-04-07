import bsvJs from 'babbage-bsv'
import { invoice3241645161d8 } from './invoice'
import { getPaymentPrivateKey } from 'sendover'

export async function makeUnlockTestRawTxBabbageBsv(params: {
    sourceTXID: string,
    sourceIndex: number,
    lockingScript: string,
    satoshis: number,
    derivationPrefix: string,
    derivationSuffix: string,
    privateKey: string,
    publicKey: string
}
): Promise<string> {

    const tx = new bsvJs.Transaction()

    tx.from(bsvJs.Transaction.UnspentOutput({
        txid: params.sourceTXID,
        outputIndex: params.sourceIndex,
        // scruptPubKey a.k.a. lockingScript or outputScript
        // (whereas scriptSig a.k.a. unlockingScript or inputScript)
        scriptPubKey: params.lockingScript,
        satoshis: params.satoshis
    }))

    const paymailHandle = undefined

    const invoiceNumber = invoice3241645161d8(params.derivationPrefix, params.derivationSuffix, paymailHandle)

    // Derive the key used to unlock funds
    const derivedPrivateKey = getPaymentPrivateKey({
        recipientPrivateKey: params.privateKey,
        senderPublicKey: params.publicKey,
        invoiceNumber
    })

    tx.sign(bsvJs.PrivateKey.fromWIF(derivedPrivateKey))

    const rawTx = tx.uncheckedSerialize() as string

    return rawTx
}