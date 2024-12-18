/* eslint-disable @typescript-eslint/no-unused-vars */
import { Beef, sdk, WERR_INTERNAL, WERR_INVALID_PARAMETER } from "@babbage/sdk-ts";
import { NinjaBase } from "../NinjaBase";
import { DojoInternalizeActionArgs } from "cwi-base";

export async function internalizeActionSdk(ninja: NinjaBase, vargs: sdk.ValidInternalizeActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
: Promise<sdk.InternalizeActionResult> {

  const { ab, tx, txid } = await validateAtomicBeef();

  const dargs: DojoInternalizeActionArgs = {
    ...vargs,
    commonDerivationPrefix: undefined
  }

  for (const o of vargs.outputs) {
    if (o.outputIndex < 0 || o.outputIndex >= tx.outputs.length)
      throw new sdk.WERR_INVALID_PARAMETER('outputIndex', `a valid output index in range 0 to ${tx.outputs.length - 1}`);
    switch (o.protocol) {
      case 'basket insertion': setupBasketInsertionForOutput(o, dargs); break;
      case 'wallet payment': setupWalletPaymentForOutput(o, dargs); break;
      default: throw new WERR_INTERNAL(`unexpected protocol ${o.protocol}`)
    }
  }

  const r: sdk.InternalizeActionResult = await ninja.dojo.internalizeActionSdk(dargs, originator)

  return r

  function setupWalletPaymentForOutput(o: sdk.InternalizeOutput, dargs: DojoInternalizeActionArgs) {
    const p = o.paymentRemittance
    if (!p) throw new WERR_INVALID_PARAMETER('paymentRemitance', `valid for protocol ${o.protocol}`);
    if (dargs.commonDerivationPrefix && dargs.commonDerivationPrefix !== p.derivationPrefix)
      throw new WERR_INVALID_PARAMETER('paymentRemitance', `the same derivationPrefix ${dargs.commonDerivationPrefix} vs ${p.derivationPrefix}`);

    throw new Error("Function not implemented.");
  }

  function setupBasketInsertionForOutput(o: sdk.InternalizeOutput, dargs: DojoInternalizeActionArgs) {
    throw new Error("Function not implemented.");
  }

  async function validateAtomicBeef() {
    const ab = Beef.fromBinary(vargs.tx);
    const txValid = await ab.verify(ninja.dojo, false);
    if (!txValid || !ab.atomicTxid)
      throw new sdk.WERR_INVALID_PARAMETER('tx', 'valid AtomicBEEF');
    const txid = ab.atomicTxid;
    const btx = ab.findTxid(txid);
    if (!btx)
      throw new sdk.WERR_INVALID_PARAMETER('tx', `valid AtomicBEEF with newest txid of ${txid}`);
    const tx = btx.tx;

    /*
    for (const i of tx.inputs) {
      if (!i.sourceTXID)
        throw new sdk.WERR_INTERNAL('beef Transactions must have sourceTXIDs')
      if (!i.sourceTransaction) {
        const btx = ab.findTxid(i.sourceTXID)
        if (!btx)
          throw new sdk.WERR_INVALID_PARAMETER('tx', `valid AtomicBEEF and contain input transaction with txid ${i.sourceTXID}`);
        i.sourceTransaction = btx.tx
      }
    }
    */

    return { ab, tx, txid }
  }
}

