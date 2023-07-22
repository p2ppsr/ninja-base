/* eslint-disable @typescript-eslint/no-unused-vars */

import { ERR_INTERNAL, ERR_INVALID_PARAMETER, ERR_DOJO_TX_BAD_AMOUNT } from "cwi-base"
import { NinjaBase } from "./NinjaBase"
import { processIncomingTransaction } from "./processIncomingTransaction"
import { NinjaSubmitDirectTransactionParams, NinjaSubmitDirectTransactionResultApi } from "../Api/NinjaApi"

export async function submitDirectTransaction(ninja: NinjaBase, params: NinjaSubmitDirectTransactionParams)
: Promise<NinjaSubmitDirectTransactionResultApi>
{
    const {
        protocol,
        transaction,
        senderIdentityKey,
        note,
        labels,
        derivationPrefix,
        amount
    } = validateSubmitDirectTransactionPrams(params)
    
    const processed = await processIncomingTransaction(ninja, transaction, protocol, false)
    if (!processed) throw new ERR_INTERNAL()

    if (amount && typeof amount === 'number') {
        if (processed.amount !== amount) {
            throw new ERR_DOJO_TX_BAD_AMOUNT(`Transaction amount is not correct! Expected: ${amount}, but got: ${processed.amount}. Transaction was not broadcast, processed or received.`)
        }
    }
    
    const submitResult = await ninja.dojo.submitDirectTransaction(protocol, transaction, senderIdentityKey, note, labels, derivationPrefix)
    
    return submitResult
}

function validateSubmitDirectTransactionPrams(params: NinjaSubmitDirectTransactionParams) : NinjaSubmitDirectTransactionParams {
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

    return params
}
