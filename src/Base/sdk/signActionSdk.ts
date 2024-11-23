/* eslint-disable @typescript-eslint/no-unused-vars */
import { sdk } from "@babbage/sdk-ts";
import { NinjaBase } from "../NinjaBase";
import { ERR_NOT_IMPLEMENTED } from "cwi-base";
import { ValidSignActionArgs, WERR_NOT_IMPLEMENTED } from "@babbage/sdk-ts/src/sdk";

  export async function signActionSdk(ninja: NinjaBase, args: ValidSignActionArgs, originator?: sdk.OriginatorDomainNameString)
  : Promise<sdk.SignActionResult> {
    const h = ninja.pendingSignActions[args.reference]
    if (!h)
      throw new WERR_NOT_IMPLEMENTED()

    const results = {
      sdk: <sdk.SignActionResult>{}
    }

    
    return results.sdk
  }
