import { GetTxWithOutputsResultApi } from "@cwi/dojo-base";
import { EnvelopeApi } from "cwi-external-services";
import { NinjaBase } from "./NinjaBase";

/* eslint-disable @typescript-eslint/no-unused-vars */
export async function getTransactionWithOutputs(
    ninja: NinjaBase,
    outputs: { script: string; satoshis: number; }[],
    labels: string[],
    inputs: Record<string, EnvelopeApi>,
    note: string,
    recipient: string,
    autoProcess?: boolean | undefined,
    feePerKb?: number | undefined
): Promise<GetTxWithOutputsResultApi> {
    
    // TODO: Implement...
    
    const r : GetTxWithOutputsResultApi = {
        rawTx: "",
        referenceNumber: "",
        inputs: [],
        amount: 0
    }
    return r
}
