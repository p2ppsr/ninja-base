/* eslint-disable @typescript-eslint/no-unused-vars */

import { ERR_INVALID_PARAMETER } from "cwi-base"

export async function submitDirectTransaction(params: {
    protocol: string,
    transaction: {
        rawTx: string,
        inputs: any,
        outputs: {
            vout: number,
            satoshis: number,
            derivationPrefix?: string,
            derivationSuffix?: string
        }[]
    },
    senderIdentityKey: string,
    note: string,
    amount: number,
    labels: string[],
    derivationPrefix?: string
}): Promise<string> {
    if (typeof params.senderIdentityKey !== 'string') throw new ERR_INVALID_PARAMETER('senderIdentityKey', 'valid')
    if (typeof params.transaction !== 'object') throw new ERR_INVALID_PARAMETER('transaction', 'an object')
    if (!Array.isArray(params.transaction.outputs)) throw new ERR_INVALID_PARAMETER('transaction.outputs', 'an array')
    if (params.transaction.outputs.length < 1) throw new ERR_INVALID_PARAMETER('transaction.outputs', 'of length greater than zero')
    if (!params.transaction.outputs.every(x =>
        typeof x === 'object'
        && typeof x['vout'] === 'number' && Number.isInteger(x['vout'])
        && typeof x['satoshis'] === 'number' && Number.isInteger(x['satoshis'])
    )) throw new ERR_INVALID_PARAMETER('transaction.outputs', 'have integer vout, integer satoshis')
    
    // Map senderIdentityKey and optional derivationPrefix onto the outputs
    params.transaction.outputs = params.transaction.outputs.map(x => {
        if (params.derivationPrefix) {
            // If provided, the global derivation prefix is also mapped
            return {
                ...x,
                derivationPrefix: params.derivationPrefix,
                senderIdentityKey: params.senderIdentityKey
            }
        } else {
            return {
                ...x,
                senderIdentityKey: params.senderIdentityKey
            }
        }
    })

    // Validate each output
    let firstDerivationPrefix: string | undefined
    for (const i in params.transaction.outputs) {
        const out = params.transaction.outputs[i]

        // SABPPP needs derivationPrefix, and derivationSuffix
        if (params.protocol === '3241645161d8') {
            if (typeof out.derivationPrefix !== 'string' || typeof out.derivationSuffix !== 'string')
                throw new ERR_INVALID_PARAMETER('transaction.outputs', 'have derivationPrefix and derivationSuffix strings')

            if (!firstDerivationPrefix) firstDerivationPrefix = out.derivationPrefix

            if (out.derivationPrefix !== firstDerivationPrefix)
                throw new ERR_INVALID_PARAMETER('transaction.outputs', 'have the same derivationPrefix')
        }
    }

    // eslint-disable-next-line
    return new Promise(async (resolve, reject) => {
        try {
            const processed = await _processIncomingTransaction({
                protocol,
                authriteClient: this.authriteClient,
                config: this.config,
                updateStatus: false,
                incomingTransaction: {
                    inputs: transaction.inputs,
                    outputs: transaction.outputs,
                    rawTransaction: transaction.rawTx
                },
                onTransactionFailed: ({ error }) => { reject(error) }
            })
            if (!processed) {
                return // Error is rejected, above.
            }
            if (typeof amount === 'number') {
                if (processed.amount !== amount) {
                    const e = new Error(
                        `Transaction amount is not correct! Expected: ${amount}, but got: ${processed.amount}. Transaction was not broadcast, processed or received.` // "Transaction was not broadcast, processed or received" on every error?
                    )
                    e.code = 'ERR_TX_BAD_AMOUNT'
                    reject(e)
                    return
                }
            }

            let requestBody = {}
            if (protocol === '3241645161d8') {
                requestBody = {
                    protocol,
                    derivationPrefix: transaction.outputs[0].derivationPrefix,
                    transaction: { // Transform transaction outputs to required format
                        ...transaction,
                        outputs: Object.fromEntries(transaction.outputs.map(out => ([
                            out.vout,
                            {
                                suffix: out.derivationSuffix,
                                basket: out.basket
                            }
                        ])))
                    },
                    labels,
                    senderIdentityKey,
                    note
                }
            } else {
                requestBody = {
                    protocol,
                    transaction: { // Transform transaction outputs to required format
                        ...transaction,
                        outputs: Object.fromEntries(transaction.outputs.map(out => ([
                            out.vout,
                            {
                                basket: out.basket,
                                customInstructions: out.customInstructions
                            }
                        ])))
                    },
                    labels,
                    senderIdentityKey,
                    note
                }
            }
            // Make the submit request to Dojo
            const submitResult = await this.createAuthriteRequest(
                'submitDirectTransaction',
                {
                    method: 'POST',
                    body: requestBody
                }
            )

            resolve(submitResult)
        } catch (e) {
            reject(e)
        }
    })
}