/* eslint-disable @typescript-eslint/no-unused-vars */
import { Chain } from 'cwi-base'
import { Dojo } from '@cwi/dojo-core'
import { NinjaApi } from '../src/Api/NinjaApi'
import { NinjaBase } from '../src/Base/NinjaBase'

import bsvJs from 'babbage-bsv'
import { promises as fsp } from 'fs'
import { DojoGetTotalOfAmountsOptions, DojoGetTransactionsOptions } from '@cwi/dojo-base'

describe('NinjaLocalSqlite', () => {

    let ninja: NinjaApi
    const identityKey = '02a1c81d78f5c404fd34c418525ba4a3b52be35328c30e67234bfcf30eb8a064d8' // tone
    const chain: Chain = 'test'
    const dataFolder = './test/data/NinjaLocalSqlite/'
    const localTestSqlite = `${dataFolder}${chain}Net_dojo.sqlite`
    
    beforeAll(async () => {
        await fsp.mkdir(dataFolder, { recursive: true })
        //try { await fsp.unlink(localTestSqlite) } catch { /* */ }

        const dojo = new Dojo(chain, dataFolder)
        await dojo.authenticate(identityKey, true)
        ninja = new NinjaBase(dojo)
    }, 300000)

    /**
     * DANGER!!! The intermediateKey is not private.
     * Anyone with access to this code could re-direct the utxos.
     * Reclaiming the UTXOS requires a sweep of the non-private private key.
     */
    test.skip('ninja-ui.send.getTransactionWithOutputs', async () => {
        const amount = '500'

        // Create a new transaction funded by user's wallet with change back to user's wallet
        // and "amount" going to a new random private key "intermediateKey".
        const intermediateKey = bsvJs.PrivateKey.fromString('KxRc7J1fcrNsnt8k5qvd2ET7idUhWv7eR85PGveb8Jj9KvV7WMw3')
        const script = new bsvJs.Script(
            bsvJs.Script.fromAddress(bsvJs.Address.fromPrivateKey(intermediateKey, 'testnet'))
        )

        const fundingTx = await ninja.getTransactionWithOutputs({
            outputs: [{
                script: script.toHex(),
                satoshis: parseInt(amount)
            }]
        })

        // Obtain a re-usable unlocking script for this new output by
        // creating a second transaction taking this new output as input 0
        // and signing it with SIGHASH_ANYONECANPAY
        const fundingTxid = new bsvJs.Transaction(fundingTx.rawTx).id
        const tx = new bsvJs.Transaction()
        tx.from(new bsvJs.Transaction.UnspentOutput({
            txid: fundingTxid,
            outputIndex: 0,
            script,
            satoshis: parseInt(amount)
        }))
        const sighashType = bsvJs.crypto.Signature.SIGHASH_FORKID |
            bsvJs.crypto.Signature.SIGHASH_NONE |
            bsvJs.crypto.Signature.SIGHASH_ANYONECANPAY
        const signature = bsvJs.Transaction.Sighash.sign(
            tx,
            intermediateKey,
            sighashType,
            0, // input index
            script, // locking script
            new bsvJs.crypto.BN(parseInt(amount))
        )
        const unlockingScript = bsvJs.Script.buildPublicKeyHashIn(
            intermediateKey.toPublicKey(),
            signature,
            signature.nhashtype
        ).toHex()

        /*
        await createAction({
            description: 'Receive money from the Ninja UI',
            inputs: {
                [fundingTxid]: {
                    ...fundingTx,
                    outputsToRedeem: [{
                        index: 0,
                        unlockingScript
                    }]
                }
            }
        })
        */
    })
})