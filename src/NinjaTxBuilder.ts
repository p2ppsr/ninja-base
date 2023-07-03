/* eslint-disable @typescript-eslint/no-unused-vars */
import bsvJs from 'babbage-bsv'
import { getPaymentAddress, getPaymentPrivateKey } from 'sendover'

import { CreateTransactionResultApi, DojoTxBuilderBase, DojoTxBuilderBaseOptions, verifyTruthy } from "@cwi/dojo-base";
import { NinjaApi, NinjaTxInputsApi } from "./Api/NinjaApi";
import { ERR_INVALID_PARAMETER } from 'cwi-base';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NinjaTxBuilderOptions extends DojoTxBuilderBaseOptions {
}

export class NinjaTxBuilder extends DojoTxBuilderBase {
    
    constructor(public ninja: NinjaApi, public options?: NinjaTxBuilderOptions) {
        super(ninja.dojo, options)
    }
    
    static buildJsTxFromCreateTransactionResult(
        ninja: NinjaApi,
        inputs: Record<string, NinjaTxInputsApi>,
        createResult: CreateTransactionResultApi
        ) : {
            tx: bsvJs.Transaction,
            outputMap: Record<string, number>,
            amount: number
        }
    {
       const changeKeys = ninja.getClientChangeKeyPair()

        const {
            inputs: txInputs,
            outputs: txOutputs,
            derivationPrefix,
            paymailHandle
        } = createResult

        const tx = new bsvJs.Transaction()

        const outputMap = {}

        txOutputs.forEach((out, i) => {
            if (out.providedBy === 'dojo' && out.purpose === 'change') {
                // Derive a change output script
                // Get derivation invoice data
                const derivationSuffix = verifyTruthy(out.derivationSuffix)
                outputMap[derivationSuffix] = i
                const invoiceNumber = this.invoiceProtocol(derivationPrefix, derivationSuffix, paymailHandle)
                // Derive the public key used for creating the output script
                const derivedAddress = getPaymentAddress({
                    senderPrivateKey: changeKeys.privateKey,
                    recipientPublicKey: changeKeys.publicKey,
                    invoiceNumber,
                    returnType: 'address'
                })
                // Create an output script that can only be unlocked with the corresponding derived private key
                tx.addOutput(new bsvJs.Transaction.Output({
                    script: new bsvJs.Script(
                        bsvJs.Script.fromAddress(derivedAddress)
                    ),
                    satoshis: out.satoshis
                }))
            } else {
                tx.addOutput(new bsvJs.Transaction.Output({
                    script: new bsvJs.Script(out.script),
                    satoshis: out.satoshis
                }))
            }
        })

        const getIndex = (o: (number | { index: number })) : number => {
            if (typeof o === 'object') {
                return o.index
            } else {
                return o
            }
        }

        // Add inputs, and sum input amounts
        let totalInputs = 0
        for (const [inputTXID, input] of Object.entries(txInputs)) {
            const t = new bsvJs.Transaction(input.rawTx)
            for (const otr of input.outputsToRedeem) {
                const otrIndex = getIndex(otr)
                const otrOutput = t.outputs[otrIndex]
                // Add utxo as new input...
                tx.from(bsvJs.Transaction.UnspentOutput({
                    txid: inputTXID,
                    outputIndex: otrIndex,
                    // scruptPubKey a.k.a. lockingScript or outputScript
                    // (whereas scriptSig a.k.a. unlockingScript or inputScript)
                    scriptPubKey: otrOutput.script,
                    satoshis: otrOutput.satoshis
                }))
                // All foreign input scripts are added unchanged
                // Find this input in original inputs to recover the already signed unlocking script
                const otrNinja = inputs[t.id]?.outputsToRedeem.find(x => x.index === getIndex(otr))
                if (otrNinja && otrNinja.unlockingScript) {
                    const txInput = tx.inputs[tx.inputs.length - 1]
                    txInput.setScript(bsvJs.Script.fromHex(otrNinja.unlockingScript))
                    // This overrides an abstract method on custom input types,
                    // indicating that the entire unlocking script is already present for
                    // this foreign input, and no new signatures are ever needed.
                    txInput.getSignatures = () => ([])
                } else { // All non-foreign inputs are summed
                    totalInputs += otrOutput.satoshis
                }
            }
        }

        //  Sign inputs using type42 derived key
        for (const input of Object.values(txInputs)) {
            for (const otr of input.outputsToRedeem) {
                const otrIndex = getIndex(otr)
                const instructions = input.instructions ? input.instructions[otrIndex] : undefined
                if (instructions) {
                    // Make sure the transaction type is supported
                    if (instructions.type !== 'P2PKH') throw new ERR_INVALID_PARAMETER(`instructions.type "${instructions.type}" is not a supported unlocking script type.`)

                    // Get derivation invoice data
                    const paymailHandle = instructions.paymailHandle
                    const derivationPrefix = verifyTruthy(instructions.derivationPrefix)
                    const derivationSuffix = verifyTruthy(instructions.derivationSuffix)

                    const invoiceNumber = this.invoiceProtocol(derivationPrefix, derivationSuffix, paymailHandle)

                    // Derive the key used to unlock funds
                    const derivedPrivateKey = getPaymentPrivateKey({
                        recipientPrivateKey: changeKeys.privateKey,
                        senderPublicKey: instructions.senderIdentityKey,
                        invoiceNumber
                    })
                    tx.sign(bsvJs.PrivateKey.fromWIF(derivedPrivateKey))
                }
            }
        }
        
        // The amount is the total of non-foreign inputs minus change outputs
        // Note that the amount can be negative when we are redeeming more inputs than we are spending
        const amount = totalInputs - txOutputs
            .filter(x => x.purpose === 'change')
            .reduce((acc, el) => acc + el.satoshis, 0)

        // The following have not yet been set, default values:
        // tx.version = 1
        // tx.nLockTime =  0

        return {
            tx,
            outputMap,
            amount
        }
    }

}
