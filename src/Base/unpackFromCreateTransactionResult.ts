import { NinjaTxInputsApi } from '../Api/NinjaApi';
import { DojoCreateTransactionResultApi, ERR_INTERNAL, ERR_INVALID_PARAMETER, EnvelopeEvidenceApi, asBsvSdkTx, verifyTruthy } from 'cwi-base';

export function unpackFromCreateTransactionResult(
  ninjaInputs: Record<string, NinjaTxInputsApi>,
  createResult: DojoCreateTransactionResultApi
): {
  amount: number,
  referenceNumber: string,
  inputs: Record<string, EnvelopeEvidenceApi>
}
{
  const {
    inputs: dojoInputs,
    outputs: dojoOutputs,
  } = createResult;

  const getIndex = (o: (number | { index: number; })): number => {
    if (typeof o === 'object') {
      return o.index;
    } else {
      return o;
    }
  };

  //////////////
  // Add INPUTS
  /////////////
  let totalInputs = 0; // Total of non-ninjaInputs (not specified as an outputToRedeem in ninjaInputs)

  let vin = -1;
  for (const [inputTXID, input] of Object.entries(dojoInputs)) {
    vin++;
    // For each transaction supplying inputs...
    const txInput = asBsvSdkTx(input.rawTx); // transaction referenced by input "outpoint" (txid,vout)
    if (txInput.id("hex") !== inputTXID)
      throw new ERR_INVALID_PARAMETER("rawTx", `match txid. Hash of rawTx is not equal to input txid ${inputTXID}`);

    for (const otr of input.outputsToRedeem) {
      // For each output being redeemed from that input transaction
      const otrIndex = getIndex(otr);
      const otrOutput = txInput.outputs[otrIndex]; // the bitcoin transaction output being spent by new transaction

      // Find this input in ninjaInputs to find if an already signed unlocking script was provided.
      const otrNinja = ninjaInputs[inputTXID]?.outputsToRedeem.find(x => x.index === otrIndex);

      // Two types of inputs are handled:
      // Type1: An already signed unlock script is provided as a hex string in otrNinja.unlockingScript
      // Type2: SABPPP protocol inputs which are signed using ScriptTemplateSABPPP.
      // 
      if (typeof otrNinja?.unlockingScript === 'string' || typeof otrNinja?.unlockingScript === 'number') {
        // Type1
      } else if (!otrNinja) {
        // Type2
        totalInputs += verifyTruthy(otrOutput.satoshis);
      } else {
        throw new ERR_INTERNAL(`unhandled input type ${vin}`);
      }
    }
  }

  // The amount is the total of non-foreign inputs minus change outputs
  // Note that the amount can be negative when we are redeeming more inputs than we are spending
  const totalOutputs = dojoOutputs.filter(x => x.purpose === 'change').reduce((acc, el) => acc + el.satoshis, 0);
  const amount = totalInputs - totalOutputs;

  const { inputs: txInputs, referenceNumber } = createResult;

  // The inputs are sanitized to remove non-envelope properties (instructions, outputsToRedeem, ...)
  const sanitizedInputs = Object.fromEntries(
    Object.entries(txInputs).map(([k, v]) => ([k, {
      inputs: v.inputs,
      mapiResponses: v.mapiResponses,
      proof: v.proof,
      rawTx: v.rawTx
    }]))
  );

  return {
    amount,
    inputs: sanitizedInputs,
    referenceNumber
  }
}
