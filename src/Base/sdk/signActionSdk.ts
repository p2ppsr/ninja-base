/* eslint-disable @typescript-eslint/no-unused-vars */
import { sdk } from "@babbage/sdk-ts";
import { NinjaBase } from "../NinjaBase";
import { ERR_NOT_IMPLEMENTED } from "cwi-base";

  export async function signActionSdk(ninja: NinjaBase, args: sdk.SignActionArgs, originator?: sdk.OriginatorDomainNameString)
  : Promise<sdk.SignActionResult> {
    throw new ERR_NOT_IMPLEMENTED()
  }
