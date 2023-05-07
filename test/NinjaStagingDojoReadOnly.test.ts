/* eslint-disable @typescript-eslint/no-unused-vars */
import { Chain } from '@cwi/base'
import { ChaintracksServiceClient } from '@cwi/chaintracks-core';
import { DojoStorageKnex, DojoStorageKnexOptions } from '@cwi/dojo-knex';
import { Dojo, DojoOptions } from '@cwi/dojo-core'
import { NinjaApi } from '../src/Api/NinjaApi'
import { NinjaBase } from '../src/Base/NinjaBase'

import { Knex, knex as makeKnex } from "knex";

import { promises as fsp } from 'fs'

import * as dotenv from 'dotenv';
dotenv.config();

describe('NinjaStagingDojoReadOnly', () => {

    let ninja: NinjaApi
    const mainDojoConnection = process.env.MAIN_DOJO_CONNECTION || ''
    const testDojoConnection = process.env.TEST_DOJO_CONNECTION || ''
    // const identityKey = '02bc91718b3572462a471de6193f357b6e85ee0f8636cb87db456cb1590f913bea' // Ty
    const identityKey = '02a1c81d78f5c404fd34c418525ba4a3b52be35328c30e67234bfcf30eb8a064d8' // Tone
    const chain: Chain = 'test'
    const dataFolder = './test/data/'
    const localTestSqlite = `${dataFolder}${chain}Net_dojo.sqlite`
    
    const createOptions = (chain: Chain, dojoConnection: string) : DojoOptions => {
        
        const config: Knex.Config = {
            client: 'mysql',
            connection: JSON.parse(dojoConnection || '{}'),
            useNullAsDefault: true,
            pool: { min: 0, max: 7, idleTimeoutMillis: 15000 }
        }
    
        const knex = makeKnex(config)
        
        const storageOptions: DojoStorageKnexOptions = {
            knex,
            chain
        }

        const storage = new DojoStorageKnex(storageOptions)
        
        const chaintracks = new ChaintracksServiceClient(chain, `http://npm-registry.babbage.systems:${chain === 'main' ? 8084 : 8083}`)

        const options = Dojo.createDojoOptions(chain, storage, chaintracks)

        return options
    }

    const deleteLocalTestSqliteFile = true

    beforeAll(async () => {
        await fsp.mkdir(dataFolder, { recursive: true })

        if (deleteLocalTestSqliteFile)
            try { await fsp.unlink(localTestSqlite) } catch { /* */ }

        const options = createOptions(chain, chain === 'test' ? testDojoConnection : mainDojoConnection)
        const dojo = new Dojo(options)
        await dojo.authenticate(identityKey, false)
        ninja = new NinjaBase(dojo)
    })

    test('getPaymail', async () => {
        const paymail = await ninja.getPaymail()
        expect(paymail).toBe('tonesnotes@openstandards.cash')
    }, 300000)

    test('copyState', async () => {
        const state = await ninja.dojo.copyState()
        expect(state.user.identityKey).toBe(identityKey)
        
        const localDojo = new Dojo(chain, dataFolder)
        await localDojo.migrate()

        await localDojo.mergeState(state)
    }, 300000)
})