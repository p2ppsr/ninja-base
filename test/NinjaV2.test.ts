import { Chain } from "cwi-base"

import { AuthriteClient } from 'authrite-js'
import { DojoExpressClient, NinjaV2 } from "../src"

import * as dotenv from 'dotenv'
dotenv.config();

const mumbleFritz = process.env.MUMBLE_FRITZ || ''

describe('NinjaV2 Test', () => {

    test("1_Verify Staging Dojo ninja.getChain", async () => {

        const chain: Chain = 'test'
        const serviceUrl = `https://${chain === 'test' ? 'staging-' : ''}dojo.babbage.systems`
        const authrite = new AuthriteClient(serviceUrl, { clientPrivateKey: mumbleFritz })
        const dojo = new DojoExpressClient(chain, serviceUrl, { authrite })
        const ninja = new NinjaV2(dojo, mumbleFritz, chain)
        
        const rChain = await ninja.getChain()
        expect(rChain).toBe('test')

    }, 300000)
})