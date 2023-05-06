/* eslint-disable @typescript-eslint/no-unused-vars */
import { Chain } from '@cwi/base'
import { Dojo } from '@cwi/dojo-core'
import { NinjaApi } from '../src/Api/NinjaApi'
import { NinjaBase } from '../src/Base/NinjaBase'

import { promises as fsp } from 'fs'

describe('NinjaLocalSqlite', () => {
    let ninja: NinjaApi
    const identityKey = '02a1c81d78f5c404fd34c418525ba4a3b52be35328c30e67234bfcf30eb8a064d8'
    const chain: Chain = 'test'
    const dataFolder = './test/data/'
    const localTestSqlite = `${dataFolder}${chain}Net_dojo.sqlite`
    
    beforeAll(async () => {
        await fsp.mkdir(dataFolder, { recursive: true })
        try { await fsp.unlink(localTestSqlite) } catch { /* */ }

        const dojo = new Dojo(chain)
        await dojo.authenticate(identityKey, true)
        ninja = new NinjaBase(dojo)
    })

    test('getPaymail', async () => {
        const paymail = await ninja.getPaymail()
        expect(paymail).toBe('tonesnotes@openstandards.cash')
    }, 300000)
})