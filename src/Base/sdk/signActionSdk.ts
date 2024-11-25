/* eslint-disable @typescript-eslint/no-unused-vars */
import { Transaction, TransactionInput } from "@bsv/sdk";
import { sdk } from "@babbage/sdk-ts";
import { NinjaBase } from "../NinjaBase";
import { ValidSignActionArgs, WERR_NOT_IMPLEMENTED } from "@babbage/sdk-ts/src/sdk";

  export async function signActionSdk(ninja: NinjaBase, vargs: ValidSignActionArgs, originator?: sdk.OriginatorDomainNameString)
  : Promise<sdk.SignActionResult> {
    const h = ninja.pendingSignActions[vargs.reference]
    if (!h)
      throw new WERR_NOT_IMPLEMENTED('recovery of out-of-session signAction reference data is not yet implemented.')

    for (const [key, spend] of Object.entries(vargs.spends)) {
      const vin = Number(key)
      const createInput = h.args.inputs[vin]
      const input = h.tx.inputs[vin]
      if (!createInput || !input || createInput) {

      }


    }

    const results = {
      sdk: <sdk.SignActionResult>{}
    }

    
    return results.sdk
  }
