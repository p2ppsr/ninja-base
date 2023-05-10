/* eslint-disable @typescript-eslint/no-unused-vars */
import { Chain } from 'cwi-base'
import { ChaintracksClientSingleton, ChaintracksSingletonClient } from '@cwi/chaintracks-core'
import { Dojo } from '@cwi/dojo-core'
import { NinjaApi } from '../src/Api/NinjaApi'
import { NinjaBase } from '../src/Base/NinjaBase'

import { default as NinjaV1 } from 'utxoninja'

import { promises as fsp } from 'fs'
import { GetTotalOfAmountsOptions, GetTransactionsOptions, validateProvenTxs } from '@cwi/dojo-base'

describe('LocalValidProofs', () => {
    let dojo: Dojo
    let ninja: NinjaApi
    let ninjaV1: NinjaV1
    let chaintracks: ChaintracksSingletonClient
    const chain: Chain = 'test'
    const dataFolder = './test/data/brayden/'
    const localTestSqlite = `${dataFolder}${chain}Net_dojo.sqlite`
    
    beforeAll(async () => {
        // Replace the default ChaintracksServiceClient with a local ChaintracksSingletonClient for speed of multiple merkleroot lookups.
        // checkCompletedTransactionProofs timedout at 300 seconds with the default.
        // After the change, it runs in 11 seconds on 3300 proof verifications, 3 msecs per verification.
        chaintracks = new ChaintracksSingletonClient(chain)
        chaintracks.startListening()
        await chaintracks.listening()
         
        const options = Dojo.createDefaultDojoOptions(chain, dataFolder)

        options.chaintracks = chaintracks
        dojo = new Dojo(options)
        const version = await dojo.migrate()
        console.log(version)
        const user = (await dojo.getUsers())[0]
        await dojo.authenticate(user.identityKey, true)
        console.log(`${user.name} ${user.userId} ${user.identityKey}`)
        console.log(localTestSqlite)

        ninja = new NinjaBase(dojo)
        
        ninjaV1 = new NinjaV1({ config: { dojoURL: 'https://staging-dojo.babbage.systems' } })
    }, 300000)
        
    afterAll(async () => {
        chaintracks.chaintracks.log = () => {/* */}
        await chaintracks.shutdown()
    })

    test('checkCompletedTransactionProofs', async () => {
        console.time('checkProofs')
        const r = await ninja.dojo.checkCompletedTransactionProofs(ninja.dojo.userId, false)
        console.timeLog('checkProofs')
        expect(r.invalid).toBe(0)
    }, 300000)

    test('validateProvenTxs', async () => {
        console.time('validateProvenTxs')
        const r = await validateProvenTxs(dojo.storage, chaintracks)
        console.timeLog('validateProvenTxs')
        expect(r).toBeGreaterThan(1000)
    }, 300000)
})