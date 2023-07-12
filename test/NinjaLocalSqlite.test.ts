/* eslint-disable @typescript-eslint/no-unused-vars */
import { Chain } from 'cwi-base'
import { Dojo } from '@cwi/dojo-core'
import { NinjaApi } from '../src/Api/NinjaApi'
import { NinjaBase } from '../src/Base/NinjaBase'

import { default as NinjaV1 } from 'utxoninja'

import { promises as fsp } from 'fs'
import { GetTotalOfAmountsOptions, GetTransactionsOptions } from '@cwi/dojo-base'

describe('NinjaLocalSqlite', () => {
    let ninja: NinjaApi
    let ninjaV1: NinjaV1
    const identityKey = '02a1c81d78f5c404fd34c418525ba4a3b52be35328c30e67234bfcf30eb8a064d8' // tone
    const chain: Chain = 'test'
    const dataFolder = './test/data/NinjaLocalSqlite/'
    const localTestSqlite = `${dataFolder}${chain}Net_dojo.sqlite`
    
    beforeAll(async () => {
        await fsp.mkdir(dataFolder, { recursive: true })
        //try { await fsp.unlink(localTestSqlite) } catch { /* */ }

        const dojo = new Dojo(chain, dataFolder)
        await dojo.authenticate(identityKey, true)
        ninja = new NinjaBase(dojo, null)
        
        ninjaV1 = new NinjaV1({ config: { dojoURL: 'https://staging-dojo.babbage.systems' } })
    }, 300000)

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

    test.skip('copyState mergeState', async () => {
        const s = await ninja.dojo.copyState()
        expect(s.user.identityKey).toBe(identityKey)
        
        const { diffs, inserts } = await ninja.dojo.mergeState(s, false)
        expect(diffs).toBe(0)
        expect(inserts).toBe(0)

    }, 300000)
    
    test('findCertificates', async () => {
        const certifiers = ['025684945b734e80522f645b9358d4ac5b49e5180444b5911bf8285a7230edee8b']
        const types = {
            'hzR38jMALB8MjX1+33hwskBj50HHGroCrD33J15PiXU=': ["domain", "identity"]
        }
        const p = { certifiers, types } 

        let certs = await ninja.findCertificates(certifiers)
        expect(certs.certificates.length).toBe(3)
        
        certs = await ninja.findCertificates({ certifiers })
        expect(certs.certificates.length).toBe(3)

        certs = await ninja.findCertificates(undefined, types)
        expect(certs.certificates.length).toBe(5)
        expect(certs.certificates[0].fields?.domain.length).toBeGreaterThan(0)
        expect(certs.certificates[0].fields?.stake).toBeUndefined()

        certs = await ninja.findCertificates({ types })
        expect(certs.certificates.length).toBe(5)

        certs = await ninja.findCertificates(p)
        expect(certs.certificates.length).toBe(3)
        expect(certs.certificates[0].fields?.domain.length).toBeGreaterThan(0)
        expect(certs.certificates[0].fields?.stake).toBeUndefined()

        const certsV1 = await ninjaV1.findCertificates(p)
        expect(certsV1.certificates.length).toBe(3)
        expect(certsV1.certificates[0].fields?.domain.length).toBeGreaterThan(0)
        expect(certsV1.certificates[0].fields?.stake.length).toBeGreaterThan(0) // API Difference
    }, 300000)

    test('getTotalValue', async () => {
        const t0 = await ninjaV1.getTotalValue()
        expect(t0.total).toBeGreaterThan(0)

        let t = await ninja.getTotalValue()
        expect(t).toBe(183584)
        t = await ninja.getTotalValue('default')
        expect(t).toBe(183584)
        t = await ninja.getTotalValue('todo tokens')
        expect(t).toBe(1000)


    }, 300000)

    test('getTotalOfAmounts', async () => {
        const o: GetTotalOfAmountsOptions = { direction: 'incoming' }
        const t0 = await ninjaV1.getTotalOfAmounts(o)
        expect(t0.total).toBeGreaterThan(0)

        const t = await ninja.getTotalOfAmounts(o)
        expect(t).toBeGreaterThan(0)

        const n = await ninja.getNetOfAmounts()
        expect(n).toBe(-115416)

    }, 300000)

    test('getAvatar', async () => {
        const t0 = await ninjaV1.getAvatar()
        expect(t0.name).toBe('TonesNotes')
        expect(t0.photoURL).toBe('uhrp:XUTED5T3rtNwrnh4m2inPALayvJ8CJP1v2pcMnDWKwYs5WdZbi3M')
        
        const t = await ninja.getAvatar()
        expect(t.name).toBe(t0.name)
        expect(t.photoURL).toBe(t0.photoURL)

        await ninja.setAvatar('bob', 'foobar')
        const t1 = await ninja.getAvatar()
        expect(t1.name).toBe('bob')
        expect(t1.photoURL).toBe('foobar')

        await ninja.setAvatar(t0.name, t0.photoURL)
        const t2 = await ninja.getAvatar()
        expect(t2.name).toBe(t0.name)
        expect(t2.photoURL).toBe(t0.photoURL)
    }, 300000)

    test('getTransactions', async () => {
        const a0 = await ninjaV1.getTransactions()
        expect(a0.totalTransactions).toBeGreaterThan(0)
        expect(a0.transactions.length).toBe(25)

        const b0 = await ninja.getTransactions()
        expect(b0.totalTransactions).toBeGreaterThan(0)
        expect(b0.transactions.length).toBe(25)
        
        const options: GetTransactionsOptions = {
           limit: 30,
           offset: 0,
           referenceNumber: '3f7bdbdd00b96d'
        }

        const a1 = await ninjaV1.getTransactions(options)
        expect(a1.totalTransactions).toBe(1)
        expect(a1.transactions.length).toBe(1)
        expect(a1.transactions[0].referenceNumber).toBe('3f7bdbdd00b96d')

        const b1 = await ninja.getTransactions(options)
        expect(b1.totalTransactions).toBe(1)
        expect(b1.transactions.length).toBe(1)
        expect(b1.transactions[0].referenceNumber).toBe('3f7bdbdd00b96d')

    }, 300000)

    test.skip('getTransactions', async () => {
        const txid = '5af9d7f042a34c156f549a42c2b24be80c409835e0c971acf84b24506b1e2d81'
        
        const e = await ninjaV1.getEnvelopeForTransaction()
    }, 300000)
})