/* eslint-disable @typescript-eslint/no-unused-vars */
import { Chain } from 'cwi-base'
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
    const mainDojoConnection = JSON.parse(process.env.MAIN_DOJO_CONNECTION || '{}')
    const testDojoConnection = JSON.parse(process.env.TEST_DOJO_CONNECTION || '{}')
    // const identityKey = '02bc91718b3572462a471de6193f357b6e85ee0f8636cb87db456cb1590f913bea' // Ty, userId 5
    const identityKey = '032e5bd6b837cfb30208bbb1d571db9ddf2fb1a7b59fb4ed2a31af632699f770a1' // Brayden, userId 12
    //const identityKey = '02a1c81d78f5c404fd34c418525ba4a3b52be35328c30e67234bfcf30eb8a064d8' // Tone, userId 9
    const chain: Chain = 'test'
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createOptions = (chain: Chain, dojoConnection: any) : DojoOptions => {
        

        dojoConnection.database = chain === 'main' ? 'dojo_v2' : 'staging_dojo_v2'

        const config: Knex.Config = {
            client: 'mysql',
            connection: dojoConnection,
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

    beforeAll(async () => {
        const options = createOptions(chain, chain === 'test' ? testDojoConnection : mainDojoConnection)
        const dojo = new Dojo(options)
        await dojo.migrate()
        await dojo.authenticate(identityKey, false)
        ninja = new NinjaBase(dojo)
    }, 3000000)

    test('test1', async () => {
        /* */
    }, 300000)

})