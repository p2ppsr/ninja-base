/* eslint-disable @typescript-eslint/no-unused-vars */

import { DojoTxBuilderBase, DojoTxBuilderBaseOptions } from "@cwi/dojo-base/src/Base/DojoTxBuilderBase"
import { DojoBase } from "@cwi/dojo-base/src/Base/DojoBase";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DojoTxBuilderOptions extends DojoTxBuilderBaseOptions {
}

export class DojoTxBuilder extends DojoTxBuilderBase {
    
    constructor(public dojoBase: DojoBase, public options?: DojoTxBuilderOptions) {
        super(dojoBase, options)
    }
}