import { Authrite } from "authrite-js"
import { Chain, DojoClientApi } from "cwi-base";
import { NinjaBase } from "./Base/NinjaBase";
import { DojoExpressClient, DojoExpressClientOptions } from "./DojoExpressClient";

export interface NinjaV1Params {
    privateKey?: string
    config?: {
        dojoURL: string // 'https://dojo.babbage.systems'

    }
    taalApiKeys?: {
        test: string // 'testnet_ba132cc4d5b2ebde7ed0ee0f6ee3f678'
        main: string // 'mainnet_6c8f8c37afd5c45e09f62d083288a181'
    }
}

/**
 * "Drop-in-replacement" for the original (v1) Ninja
 */
export class Ninja extends NinjaBase {
    constructor(dojo: NinjaV1Params | DojoClientApi, clientPrivateKey?: string, authrite?: Authrite) {
        if (dojo['privateKey'] || dojo['config']) {
            const params = <NinjaV1Params>dojo
            clientPrivateKey = params.privateKey
            const serviceUrl = params.config?.dojoURL || 'https://dojo.babbage.systems'
            const chain: Chain = serviceUrl === 'https://dojo.babbage.systems' ? 'main' : 'test'
            const options: DojoExpressClientOptions = {
                useAuthrite: true
            }
            dojo = new DojoExpressClient(chain, serviceUrl, options)
        } else
            dojo = <DojoClientApi>dojo

        super(dojo, clientPrivateKey, authrite)
    }
}