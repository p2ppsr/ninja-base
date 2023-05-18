/* eslint-disable @typescript-eslint/no-unused-vars */
import { Chain } from 'cwi-base'
import { Dojo } from '@cwi/dojo-core'
import { NinjaApi } from '../src/Api/NinjaApi'
import { NinjaBase } from '../src/Base/NinjaBase'

import { default as NinjaV1 } from 'utxoninja'

import { promises as fsp } from 'fs'
import { GetTotalOfAmountsOptions, GetTransactionsOptions } from '@cwi/dojo-base'

describe('ninjaV1.test', () => {
    let ninjaV1: NinjaV1
    
    beforeAll(async () => {
        ninjaV1 = new NinjaV1({ config: { dojoURL: 'https://staging-dojo.babbage.systems' } })
    }, 300000)

    test('getTotalOfAmounts', async () => {
        const o: GetTotalOfAmountsOptions = { direction: 'incoming' }
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
})
