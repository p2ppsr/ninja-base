/* eslint-disable @typescript-eslint/no-unused-vars */
import { sdk } from "@babbage/sdk-ts";
import { NinjaBase } from "../NinjaBase";
import { ERR_NOT_IMPLEMENTED } from "cwi-base";

  export async function relinquishOutputSdk(ninja: NinjaBase, vargs: sdk.ValidRelinquishOutputArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
  : Promise<sdk.RelinquishOutputResult> {
    throw new ERR_NOT_IMPLEMENTED()
  }
