/* eslint-disable @typescript-eslint/no-unused-vars */
import { Chain } from '@cwi/base'
import { Dojo } from '@cwi/dojo-core'
import { NinjaApi } from '../src/Api/NinjaApi'
import { NinjaBase } from '../src/Base/NinjaBase'

import { default as NinjaV1 } from 'utxoninja'

import { promises as fsp } from 'fs'

describe('NinjaLocalSqlite', () => {
    let ninja: NinjaApi
    let ninjaV1: NinjaV1
    const identityKey = '02a1c81d78f5c404fd34c418525ba4a3b52be35328c30e67234bfcf30eb8a064d8'
    const chain: Chain = 'test'
    const dataFolder = './data/'
    const localTestSqlite = `${dataFolder}${chain}Net_dojo.sqlite`
    
    beforeAll(async () => {
        await fsp.mkdir(dataFolder, { recursive: true })
        //try { await fsp.unlink(localTestSqlite) } catch { /* */ }

        const dojo = new Dojo(chain)
        await dojo.authenticate(identityKey, true)
        ninja = new NinjaBase(dojo)
        
        ninjaV1 = new NinjaV1({ config: { dojoURL: 'https://staging-dojo.babbage.systems' } })
    })

    test('getPaymail', async () => {
        const paymail = await ninja.getPaymail()
        expect(paymail).toBe('tonesnotes@openstandards.cash')
    }, 300000)

    test('getChain', async () => {
        const c = await ninja.getChain()
        expect(c).toBe(chain)
    }, 300000)

    test('getNetwork', async () => {
        let c = await ninja.getNetwork()
        expect(c).toBe(chain + 'net')
        c = await ninja.getNetwork('default')
        expect(c).toBe(chain + 'net')
        c = await ninja.getNetwork('nonet')
        expect(c).toBe(chain)
    }, 300000)

    test('copyState mergeState', async () => {
        const s = await ninja.dojo.copyState()
        expect(s.user.identityKey).toBe(identityKey)
        
        const { diffs, inserts } = await ninja.dojo.mergeState(s, false)
        expect(diffs).toBe(0)
        expect(inserts).toBe(0)

    }, 300000)
    
    test('findCertificates', async () => {
        let certs = await ninja.findCertificates(['025684945b734e80522f645b9358d4ac5b49e5180444b5911bf8285a7230edee8b'])
        expect(certs.length).toBe(3)
        certs = await ninja.findCertificates({ certifiers: ['025684945b734e80522f645b9358d4ac5b49e5180444b5911bf8285a7230edee8b'] })
        expect(certs.length).toBe(3)
    }, 300000)

    test('getTotalValue', async () => {
        const t0 = await ninjaV1.getTotalValue()
        expect(t0).toBe(184371)

        let t = await ninja.getTotalValue()
        expect(t).toBe(t0)
        expect(t).toBe(184371)
        t = await ninja.getTotalValue('default')
        expect(t).toBe(184371)
        t = await ninja.getTotalValue('todo tokens')
        expect(t).toBe(1000)


    }, 300000)
})