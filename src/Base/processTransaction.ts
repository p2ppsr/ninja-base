/* eslint-disable @typescript-eslint/no-unused-vars */
import { DojoApi } from "@cwi/dojo-base"
import { Authrite } from 'authrite-js'

/**
 * After a transaction is created (with `createTransaction` or with `getTransactionWithOutputs`)
 * this is used to process the transaction, thereby activating any change outputs and flagging
 * designated inputs as spent
 *
 * @param inputs Inputs to spend as part of this transaction
 *
 * @param submittedTransaction The transaction that has been created and signed
 *
 * @param reference The reference number provided by `createTransaction` or `getTransactionWithOutputs`
 *
 * @param outputMap An object whose keys are derivation prefixes and whose values are corresponding
 *  change output numbers from the transaction.
 *
 * @returns {Promise<Object>} An object containing a `note` field with a success message,
 *  and `mapiResponses`, for use in creating an SPV Envelope
 */
export async function processTransaction(
    submittedTransaction: string,
    inputs: unknown,
    reference: string,
    outputMap: Record<string, number>,
    dojo: DojoApi,
    authriteClient: Authrite,
    ) : Promise<void> {
/*
    try {
        const result = await dojo.processTransaction()
        const result = await this.createAuthriteRequest('processTransaction', {
            method: 'POST',
            body: { hex: submittedTransaction, reference, outputMap }
        })
        return result
    } catch (error) {
        // Free up UTXOs since the transaction failed before throwing the error
        // Unless there was a double spend error
        if (reference) {
            try {
                await this.updateTransactionStatus({
                    reference,
                    status: 'failed'
                })
            } catch (e) { // ignore, we still need the code below
            }
        }
        // Check if we need to handle a double spend attempt
        if (error.message.toLowerCase().includes('missing inputs')) {
            const woc = new WhatsOnChain(await this.getNetwork())
            const tx = bsv.Transaction(submittedTransaction)

            const spendingTransactions = {}
            for (const [inputTxId, inputEnvelope] of Object.entries(inputs)) {
                // Find the vouts associated with this input transaction
                const vouts = tx.inputs.filter(x => x.prevTxId.toString('hex') === inputTxId).map(x => x.outputIndex)
                let inputTransactionDetails = ''
                try {
                    inputTransactionDetails = await axios.post(`https://api.whatsonchain.com/v1/bsv/${await this.getNetwork('nonet')}/ui/tx/decode`, {
                        network: await this.getNetwork('nonet'),
                        txhex: inputEnvelope.rawTx
                    })
                } catch (error) {
                    const e = new Error('Could net get transaction(s) responsible for double spend!')
                    e.code = 'ERR_WOC_REQUEST_FAILED'
                    throw e
                }
                for (const inputVout of vouts) {
                    const outputScriptHex = inputTransactionDetails.data.vout[inputVout].scripthash
                    // Note: Maybe reduce network calls by calculate output script here:
                    // const scriptHash = bsv.crypto.Hash.sha256sha256(Buffer.from(outputScriptHex, 'hex')).toString('hex')
                    const spendingCandidates = await woc.historyByScriptHash(outputScriptHex)
                    for (const candidate of spendingCandidates) {
                        const candidateRawTx = await woc.getRawTxData(candidate.tx_hash)
                        const candidateParsedTx = new bsv.Transaction(candidateRawTx)
                        const commonInputs = candidateParsedTx.inputs.filter(x => x.prevTxId.toString('hex') === inputTxId && x.outputIndex === inputVout)

                        // Check if common inputs were found
                        if (commonInputs.length > 0) {
                            spendingTransactions[candidate.tx_hash] = 1

                            try {
                                // Set spendable to false for the UTXO that was spent by the tx given as inputTxId
                                await this.updateOutpointStatus({ txid: inputTxId, vout: inputVout, spendable: false })
                            } catch (error) {
                                // "Tried to update the outpoint status, nothing we can do" (Ty) :/ 
                            }
                        }
                    }
                }
            }

            // Hydrate the envelope data for the spending transactions
            for (const txid of Object.keys(spendingTransactions)) {
                try {
                    const env = await hashwrap(txid, { network: await this.getNetwork(), taalApiKey: this.taalApiKeys[await this.getNetwork('nonet')] })
                    spendingTransactions[txid] = env
                } catch (error) {
                    // nothing we can do! 
                }
            }

            // Format an error message that can be parsed by the calling application.
            const e = new Error('One or more inputs have already been spent! \n Learn how to handle double spends within your apps: https://projectbabbage.com/docs/babbage-sdk/reference/handling-double-spends')
            e.code = 'ERR_DOUBLE_SPEND'
            e.spendingTransactions = spendingTransactions
            throw e
        }
        throw error
    }
    */
}
