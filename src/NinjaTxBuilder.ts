/* eslint-disable @typescript-eslint/no-unused-vars */
import { Script, Spend, Transaction } from '@bsv/sdk'
import bsvJs from 'babbage-bsv'
import { getPaymentAddress, getPaymentPrivateKey } from 'sendover'

import {
  DojoCreateTransactionResultApi, DojoCreatingTxInputsApi, DojoCreatingTxOutputApi,
  DojoPendingTxApi,
  ERR_INVALID_PARAMETER, ERR_NOT_IMPLEMENTED,
  bsv, asBsvTx, verifyTruthy, asString, asBsvSdkTx, CwiError
} from 'cwi-base'

import { KeyPairApi, NinjaApi, NinjaTxInputsApi } from './Api/NinjaApi'
import { NinjaBase } from './Base/NinjaBase'
import { DojoTxBuilderBase, DojoTxBuilderBaseOptions } from './Base/DojoTxBuilderBase'
import { invoice3241645161d8 } from './invoice'
import { ERR_NINJA_INVALID_UNLOCK, ERR_NINJA_MISSING_UNLOCK } from './ERR_NINJA_errors'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NinjaTxBuilderOptions extends DojoTxBuilderBaseOptions {
}

/**
 * NinjaTxBuilder is intended to complement DojoTxBuilder, implementing the signing functions
 * that only Ninja can do with access to private keys.
 *
 * Ultimately most of the generically useful code that supports building and signing
 * actual bitcoin transactions should be collected here.
 *
 * This is a work in progress...
 */
export class NinjaTxBuilder extends DojoTxBuilderBase {
  constructor(public ninja: NinjaApi, public options?: NinjaTxBuilderOptions) {
    super(ninja.dojo, options)
  }

  // TODO: For this to work, NinjaTxInputsApi with unlocking scripts need a way into
  // the flow.
  static buildJsTxFromPendingTx(ninja: NinjaBase, ptx: DojoPendingTxApi): {
    tx: bsvJs.Transaction
    outputMap: Record<string, number>
    amount: number
  } {
    throw new ERR_NOT_IMPLEMENTED()
  }

  static buildJsTxFromCreateTransactionResult(
    ninja: NinjaApi,
    inputs: Record<string, NinjaTxInputsApi>,
    createResult: DojoCreateTransactionResultApi,
    lockTime?: number
  ): {
    tx: bsvJs.Transaction
    outputMap: Record<string, number>
    amount: number
    log?: string
  } {
    const {
      inputs: txInputs,
      outputs: txOutputs,
      derivationPrefix,
      paymailHandle
    } = createResult

    return this.buildJsTx(ninja, inputs, txInputs, txOutputs, derivationPrefix, paymailHandle, lockTime, createResult.log);
  }

  /**
   * @param ninja The authority constructing this new transaction
   * @param ninjaInputs External inputs to be added not known to ninja's dojo.
   * @param dojoInputs Inputs to be added that are known to ninja's dojo.
   * @param dojoOutputs All new outputs to be created
   * @param derivationPrefix 
   * @param paymailHandle 
   * @param lockTime 
   * @returns new signed bitcoin transaction, output map, an impact amount on authority's balance
   */
  static buildJsTx(
    ninja: NinjaApi,
    ninjaInputs: Record<string, NinjaTxInputsApi>,
    dojoInputs: Record<string, DojoCreatingTxInputsApi>,
    dojoOutputs: DojoCreatingTxOutputApi[],
    derivationPrefix: string,
    paymailHandle?: string,
    lockTime?: number,
    log?: string
  ): {
    tx: bsvJs.Transaction
    outputMap: Record<string, number>
    amount: number
    log?: string
  } {
    const changeKeys = ninja.getClientChangeKeyPair()

    const tx = new bsvJs.Transaction()

    const outputMap: Record<string, number> = {}

    dojoOutputs.forEach((out, i) => {
      // Add requested outputs to new bitcoin transaction tx

      let lockingScript

      if (out.providedBy === 'dojo' && out.purpose === 'change') {

        // Derive a change output locking script
        const derivationSuffix = verifyTruthy(out.derivationSuffix)

        outputMap[derivationSuffix] = i

        lockingScript = generateLockingScriptType3241645161d8(
          changeKeys, derivationPrefix, derivationSuffix, paymailHandle
        )

      } else {

        // Add transaction output with external supplied locking script.
        lockingScript = new bsvJs.Script(out.script)

      }

      const newOutput = new bsvJs.Transaction.Output({
        script: lockingScript,
        satoshis: out.satoshis
      })

      tx.addOutput(newOutput)

    })

    const getIndex = (o: (number | { index: number })): number => {
      if (typeof o === 'object') {
        return o.index
      } else {
        return o
      }
    }

    const unlockScriptsToVerify: {
      lockingScript: Buffer,
      vin: number,
      amount: number
    }[] = []

    // Add inputs, and sum input amounts
    let totalInputs = 0
    for (const [inputTXID, input] of Object.entries(dojoInputs)) {
      // For each transaction supplying inputs...

      const txInput = new bsvJs.Transaction(input.rawTx) // transaction referenced by input "outpoint" (txid,vout)

      for (const otr of input.outputsToRedeem) {
        // For each output being redeemed from that input transaction

        const otrIndex = getIndex(otr)
        const otrOutput = txInput.outputs[otrIndex] // the bitcoin transaction output being spent by new transaction

        unlockScriptsToVerify.push({
          lockingScript: otrOutput.script.toBuffer(),
          vin: unlockScriptsToVerify.length,
          amount: otrOutput.satoshis
        })

        // Add utxo as new input...
        tx.from(bsvJs.Transaction.UnspentOutput({
          txid: inputTXID,
          outputIndex: otrIndex,
          // scruptPubKey a.k.a. lockingScript or outputScript
          // (whereas scriptSig a.k.a. unlockingScript or inputScript)
          scriptPubKey: otrOutput.script,
          satoshis: otrOutput.satoshis
        }))

        // All foreign input scripts are added unchanged
        // Find this input in original inputs to recover the already signed unlocking script
        const otrNinja = ninjaInputs[txInput.id]?.outputsToRedeem.find(x => x.index === getIndex(otr))
        if ((otrNinja != null) && otrNinja.unlockingScript) {
          const txInput = tx.inputs[tx.inputs.length - 1]
          txInput.setScript(bsvJs.Script.fromHex(otrNinja.unlockingScript))
          // This overrides an abstract method on custom input types,
          // indicating that the entire unlocking script is already present for
          // this foreign input, and no new signatures are ever needed.
          txInput.getSignatures = () => ([])
          // Set a custom sequence number, if provided
          if (typeof otrNinja.sequenceNumber === 'number') {
            txInput.sequenceNumber = otrNinja.sequenceNumber
          }
        } else { // All non-foreign inputs are summed
          totalInputs += otrOutput.satoshis
        }
      }
    }

    // Set a custom lock time if provided
    if (typeof lockTime === 'number') {
      tx.nLockTime = lockTime
    }

    //  Sign inputs using type42 derived key
    for (const input of Object.values(dojoInputs)) {
      for (const otr of input.outputsToRedeem) {
        const otrIndex = getIndex(otr)
        const instructions = input.instructions ? input.instructions[otrIndex] : undefined
        if (instructions != null) {
          // Make sure the transaction type is supported
          if (instructions.type !== 'P2PKH') throw new ERR_INVALID_PARAMETER(`instructions.type "${instructions.type}" is not a supported unlocking script type.`)

          // Get derivation invoice data
          const paymailHandle = instructions.paymailHandle
          const derivationPrefix = verifyTruthy(instructions.derivationPrefix)
          const derivationSuffix = verifyTruthy(instructions.derivationSuffix)

          const invoiceNumber = invoice3241645161d8(derivationPrefix, derivationSuffix, paymailHandle)

          // Derive the key used to unlock funds
          const derivedPrivateKey = getPaymentPrivateKey({
            recipientPrivateKey: changeKeys.privateKey,
            senderPublicKey: instructions.senderIdentityKey,
            invoiceNumber
          })
          tx.sign(bsvJs.PrivateKey.fromWIF(derivedPrivateKey))
        }
      }
    }

    // Verify unlocking scripts
    const rawTx = tx.uncheckedSerialize()
    const txToValidate = asBsvSdkTx(rawTx)
    txToValidate.inputs.forEach((txin, i) => {
      const vus = unlockScriptsToVerify.find(v => v.vin === i)
      if (!vus)
        throw new ERR_NINJA_MISSING_UNLOCK(i)
      let e: CwiError | undefined = undefined
      let ok = false
      try {
        ok = validateUnlockScriptWithBsvSdk(txToValidate, vus.vin, vus.lockingScript, vus.amount)
      } catch (eu: unknown) {
        e = CwiError.fromUnknown(eu)
      }
      if (!ok || e)
        throw new ERR_NINJA_INVALID_UNLOCK(vus.vin, txin.sourceTXID || '', txin.sourceOutputIndex, rawTx, e)
    })

    // The amount is the total of non-foreign inputs minus change outputs
    // Note that the amount can be negative when we are redeeming more inputs than we are spending
    const amount = totalInputs - dojoOutputs
      .filter(x => x.purpose === 'change')
      .reduce((acc, el) => acc + el.satoshis, 0)

    // The following have not yet been set, default values:
    // tx.version = 1
    // tx.nLockTime =  0

    return {
      tx,
      outputMap,
      amount,
      log
    }
  }
}

function generateLockingScriptType3241645161d8(keyPair: KeyPairApi, derivationPrefix: string, derivationSuffix: string, paymailHandle?: string) {
  const invoiceNumber = invoice3241645161d8(derivationPrefix, derivationSuffix, paymailHandle)
  // Derive the public key used for creating the output script
  const derivedAddress = getPaymentAddress({
    senderPrivateKey: keyPair.privateKey,
    recipientPublicKey: keyPair.publicKey,
    invoiceNumber,
    returnType: 'address'
  })
  // Create an output script that can only be unlocked with the corresponding derived private key
  const lockingScript = bsvJs.Script.fromAddress(derivedAddress)
  return lockingScript
}

export function validateUnlockScript(
  txToValidate: bsv.Tx,
  vin: number,
  lockingScript: Buffer,
  amount: number
): boolean {
  const input = txToValidate.txIns[vin];
  const scriptSig = input.script;
  const scriptPubKey = bsv.Script.fromBuffer(lockingScript)
  const valid = new bsv.Interp().verify(
    scriptSig,
    scriptPubKey,
    txToValidate,
    vin,
    (bsv.Interp.SCRIPT_ENABLE_SIGHASH_FORKID
      // Neither of these fags exist in 2023 bitcoin-sv
      // Both signal that additional restored op codes were enabled.
      // They are now? And these flags aren't needed?
      // | bsv.Interp.SCRIPT_ENABLE_MAGNETIC_OPCODES
      // | bsv.Interp.SCRIPT_ENABLE_MONOLITH_OPCODES
    ),
    new bsv.Bn(amount)
  );
  return valid
}

export function validateUnlockScriptWithBsvSdk(
  spendingTx: Transaction,
  vin: number,
  lockingScript: string | Buffer,
  amount: number
): boolean {
  const spend = new Spend({
    sourceTXID: verifyTruthy(spendingTx.inputs[vin].sourceTXID),
    sourceOutputIndex: spendingTx.inputs[vin].sourceOutputIndex,
    sourceSatoshis: amount,
    lockingScript: Script.fromHex(asString(lockingScript)),
    transactionVersion: spendingTx.version,
    otherInputs: spendingTx.inputs.filter((v, i) => i !== vin),
    inputIndex: vin,
    unlockingScript: verifyTruthy(spendingTx.inputs[vin].unlockingScript),
    outputs: spendingTx.outputs,
    inputSequence: spendingTx.inputs[vin].sequence,
    lockTime: spendingTx.lockTime
  })

  const valid = spend.validate()
  return valid
}
