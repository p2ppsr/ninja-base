import { AuthriteClient } from "authrite-js"
import { Chain, DojoClientApi, ERR_INVALID_PARAMETER } from "cwi-base";
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
    constructor(dojo: NinjaV1Params | DojoClientApi, clientPrivateKey?: string, authrite?: AuthriteClient) {
        if (!dojo['getUser']) {
            // Support for V1 params style construction
            if (clientPrivateKey || authrite) throw new ERR_INVALID_PARAMETER('clientPrivateKey and authrite', 'undefined when using NinjaV1Params')
            const params = <NinjaV1Params>dojo
            const serviceUrl = params.config?.dojoURL || 'https://dojo.babbage.systems'
            const chain: Chain = serviceUrl === 'https://dojo.babbage.systems' ? 'main' : 'test'
            authrite = new AuthriteClient(serviceUrl, { clientPrivateKey: params.privateKey })
            const options: DojoExpressClientOptions = {
                authrite
            }
            dojo = new DojoExpressClient(chain, serviceUrl, options)
        } else
            dojo = <DojoClientApi>dojo

        super(dojo, clientPrivateKey, authrite)
    }
}