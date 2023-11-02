/* eslint-disable @typescript-eslint/no-unused-vars */
import { DojoGetTotalOfAmountsOptions, DojoGetTransactionsOptions } from 'cwi-base'

import bsv from 'babbage-bsv'
import { default as NinjaV1 } from 'utxoninja'

/**
 * Tests to obtain legacy data from v1 Ninja / Dojo for format and content verification.
 * 
 * NOTE: Stageline Metanet Client must be running to enable Ninja's use of Authrite.
 * Permission requests must also be granted.
 */
describe.skip('ninjaV1.test', () => {
    let ninjaV1: NinjaV1
    
    beforeAll(async () => {
        ninjaV1 = new NinjaV1({ config: { dojoURL: 'https://staging-dojo.babbage.systems' } })
    }, 300000)

    test('getTotalOfAmounts', async () => {
        const o: DojoGetTotalOfAmountsOptions = { direction: 'incoming' }
        const t0 = await ninjaV1.getTotalOfAmounts(o)
        expect(t0.total).toBeGreaterThan(0)
    }, 300000)

    test('getAvatar', async () => {
        const t0 = await ninjaV1.getAvatar()
        expect(t0.name).toBe('TonesNotes')
        expect(t0.photoURL).toBe('uhrp:XUTED5T3rtNwrnh4m2inPALayvJ8CJP1v2pcMnDWKwYs5WdZbi3M')
    }, 300000)

    test('getTransactions', async () => {
        const app = ''
        const label = app ? `babbage_app_${app}` : undefined

        const a0 = await ninjaV1.getTransactions({
            limit: 10,
            label,
            status: 'completed'
          })
          expect(a0.transactions.length).toBe(10)

    }, 300000)

    test('findCertificates', async () => {
        const certifiers = ['025684945b734e80522f645b9358d4ac5b49e5180444b5911bf8285a7230edee8b']
        const types = {
            'hzR38jMALB8MjX1+33hwskBj50HHGroCrD33J15PiXU=': ["domain", "identity"]
        }
        const p = { certifiers, types } 

        const certsV1 = await ninjaV1.findCertificates(p)
        expect(certsV1.certificates.length).toBe(3)
        expect(certsV1.certificates[0].fields?.domain.length).toBeGreaterThan(0)
        expect(certsV1.certificates[0].fields?.stake.length).toBeGreaterThan(0) // API Difference, since 'stake' field was not requested in types, it should not be returned, but it is
    }, 300000)

    test('getTotalValue', async () => {
        const t0 = await ninjaV1.getTotalValue()
        expect(t0.total).toBeGreaterThan(0)
    }, 300000)

    test('getTransactions', async () => {
        const a0 = await ninjaV1.getTransactions()
        expect(a0.totalTransactions).toBeGreaterThan(0)
        expect(a0.transactions.length).toBe(25)

        const options: DojoGetTransactionsOptions = {
           limit: 30,
           offset: 0,
           referenceNumber: '3f7bdbdd00b96d'
        }

        const a1 = await ninjaV1.getTransactions(options)
        expect(a1.totalTransactions).toBe(1)
        expect(a1.transactions.length).toBe(1)
        expect(a1.transactions[0].referenceNumber).toBe('3f7bdbdd00b96d')

    }, 300000)
    
    /**
     * DANGER!!! The intermediateKey IS NOT SAVED. If fundingTx is processed but the following
     * createAction doesn't get completed successfully BITCOIN WILL BE LOST.
     */
    test.skip('ninja-ui.send.getTransactionWithOutputs', async () => {
        const amount = '500'

        // Create a new transaction funded by user's wallet with change back to user's wallet
        // and "amount" going to a new random private key "intermediateKey".
        const intermediateKey = bsv.PrivateKey.fromRandom()
        const script = new bsv.Script(
            bsv.Script.fromAddress(bsv.Address.fromPrivateKey(intermediateKey, 'testnet'))
        )

        // DANGER!!! The intermediateKey IS NOT SAVED. If fundingTx is processed but the following
        // createAction doesn't get completed successfully BITCOIN WILL BE LOST.

        const fundingTx = await ninjaV1.getTransactionWithOutputs({
            outputs: [{
                script: script.toHex(),
                satoshis: parseInt(amount)
            }]
        })

        // Obtain a re-usable unlocking script for this new output by
        // creating a second transaction taking this new output as input 0
        // and signing it with SIGHASH_ANYONECANPAY
        const fundingTxid = new bsv.Transaction(fundingTx.rawTx).id
        const tx = new bsv.Transaction()
        tx.from(new bsv.Transaction.UnspentOutput({
            txid: fundingTxid,
            outputIndex: 0,
            script,
            satoshis: parseInt(amount)
        }))
        const sighashType = bsv.crypto.Signature.SIGHASH_FORKID |
            bsv.crypto.Signature.SIGHASH_NONE |
            bsv.crypto.Signature.SIGHASH_ANYONECANPAY
        const signature = bsv.Transaction.Sighash.sign(
            tx,
            intermediateKey,
            sighashType,
            0, // input index
            script, // locking script
            new bsv.crypto.BN(parseInt(amount))
        )
        const unlockingScript = bsv.Script.buildPublicKeyHashIn(
            intermediateKey.publicKey,
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
