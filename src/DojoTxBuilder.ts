/* eslint-disable @typescript-eslint/no-unused-vars */

import { DojoClientApi } from "cwi-base";
import { DojoTxBuilderBase, DojoTxBuilderBaseOptions } from "./Base/DojoTxBuilderBase";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DojoTxBuilderOptions extends DojoTxBuilderBaseOptions {
}

export class DojoTxBuilder extends DojoTxBuilderBase {
    
    constructor(dojo: DojoClientApi, public options?: DojoTxBuilderOptions) {
        super(dojo, options)
    }
}