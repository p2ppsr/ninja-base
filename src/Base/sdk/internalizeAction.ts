/* eslint-disable @typescript-eslint/no-unused-vars */
import { sdk } from "@babbage/sdk-ts";
import { NinjaBase } from "../NinjaBase";
import { ERR_NOT_IMPLEMENTED } from "cwi-base";

  export async function internalizeActionSdk(ninja: NinjaBase, args: sdk.InternalizeActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
  : Promise<sdk.InternalizeActionResult> {
    throw new ERR_NOT_IMPLEMENTED()
  }
