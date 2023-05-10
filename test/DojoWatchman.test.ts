/* eslint-disable @typescript-eslint/no-unused-vars */
import { Chain } from 'cwi-base'
import { ChaintracksSingletonClient } from '@cwi/chaintracks-core'
import { Dojo } from '@cwi/dojo-core'
import { NinjaApi } from '../src/Api/NinjaApi'
import { NinjaBase } from '../src/Base/NinjaBase'

import { default as NinjaV1 } from 'utxoninja'

import { promises as fsp } from 'fs'
import { DojoWatchman, validateProvenTxs } from '@cwi/dojo-base'

describe('DojoWatchman.test', () => {
    let dojo: Dojo
    let ninja: NinjaApi
    let ninjaV1: NinjaV1
    let chaintracks: ChaintracksSingletonClient
    const chain: Chain = 'test'
    const dataFolder = './test/data/brayden/'
    const localTestSqlite = `${dataFolder}${chain}Net_dojo.sqlite`
    const useLocalChaintracks = true
    
    beforeAll(async () => {
        // Replace the default ChaintracksServiceClient with a local ChaintracksSingletonClient for speed of multiple merkleroot lookups.
        // checkCompletedTransactionProofs timedout at 300 seconds with the default.
        // After the change, it runs in 11 seconds on 3300 proof verifications, 3 msecs per verification.
         
        const options = Dojo.createDefaultDojoOptions(chain, dataFolder)

        if (useLocalChaintracks) {
            chaintracks = new ChaintracksSingletonClient(chain)
            chaintracks.startListening()
            await chaintracks.listening()
            options.chaintracks = chaintracks
        }

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
        if (useLocalChaintracks) {
            chaintracks.chaintracks.log = () => {/* */ }
            await chaintracks.shutdown()
        }
    })

    test('initialDatabaseReview', async () => {
        console.time('initialDatabaseReview')
        const dwm = new DojoWatchman(dojo)
        await dwm.initialDatabaseReview()
        console.timeLog('initialDatabaseReview')
    })

    test('process unknown ProvenTxReqs', async () => {
        console.time('process unknown')
        const dwm = new DojoWatchman(dojo)
        await dwm.processProvenTxReqs()
        console.timeLog('process unknown')
    }, 300000)

    test('validateProvenTxs', async () => {
        console.time('validateProvenTxs')
        const r = await validateProvenTxs(dojo.storage, chaintracks)
        console.timeLog('validateProvenTxs')
        expect(r).toBeGreaterThan(1000)
    }, 300000)
})