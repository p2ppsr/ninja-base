import { AuthriteClient } from "authrite-js"
import { Chain, DojoClientApi } from "cwi-base";
import { NinjaBase } from "./Base/NinjaBase";
import { DojoExpressClient } from "./DojoExpressClient";

/**
 * A ninja that also creates a default DojoClientExpress syncDojo configured to sync an existing user's state
 * from a dojoURL parameter (either https://staging-dojo.babbage.systems or https://dojo.babbage.systems by default)
 */
export class NinjaV2 extends NinjaBase {
    constructor(dojo: DojoClientApi, clientPrivateKey: string, chain: Chain) {

        const serviceUrl = `https://${chain === 'test' ? 'staging-' : ''}dojo.babbage.systems`

        const authrite = new AuthriteClient(serviceUrl, { clientPrivateKey })

        const cloudDojo = new DojoExpressClient(chain, serviceUrl, { authrite })
        
        dojo.setSyncDojos([ cloudDojo ], { syncOnAuthenticate: true })

        super(dojo, clientPrivateKey)
    }
}