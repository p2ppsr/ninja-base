/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  CwiError, DojoClientApi, DojoCreateTxOutputApi, DojoCreatingTxInputsApi, DojoCreatingTxOutputApi,
  validateCustomInstructions, validateOutputDescription,
  validateSatoshis, validateScript, validateTxLabel,
  ERR_DOJO_CREATE_TX_EMPTY,
  transactionSize
} from 'cwi-base'

export interface DojoTxBuilderInputApi {
  txid: string
  vout: number
  satoshis: number
  scriptLength: number
  script?: string
}

export interface DojoTxBuilderOutputApi {
  satoshis: number
  script: string
  vout: number
  index: number
  change: boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DojoTxBuilderBaseOptions {
}

export class DojoTxBuilderBase {
  constructor (public dojo: DojoClientApi, public baseOptions?: DojoTxBuilderBaseOptions) {
    this.inputs = []
    this.outputs = []
    this.outputsChange = []
  }

  /**
     * inputs that will fund the transaction
     */
  inputs: DojoTxBuilderInputApi[]

  /**
     * outputs with pre-determined, non-adjustable amounts that will be created by the transaction
     */
  outputs: DojoTxBuilderOutputApi[]

  /**
     * change outputs generated to recapture excess funding
     * owned by authenticated user.
     * adjustable amounts.
     */
  outputsChange: DojoTxBuilderOutputApi[]

  /**
     *  The current total value in satoshis of the selected inputs,
     */
  funding (): number {
    return this.inputs.reduce((a, e) => a + e.satoshis, 0)
  }

  /**
     * The current total value in satoshis of the amounts for all outputs
     */
  spending (): number {
    return this.outputs.reduce((a, e) => a + e.satoshis, 0)
  }

  /**
     * The current total value in satoshis of the amounts for all outputsChange
     */
  change (): number {
    return this.outputsChange.reduce((a, e) => a + e.satoshis, 0)
  }

  /**
     * The amount of this transaction as currently configured.
     *
     * `change` less `funding`
     *
     * Normally negative. The is the change in total value of authenticated user's unspent outputs.
     */
  amount (): number {
    return this.change() - this.funding()
  }

  /**
     * Must return the fee required by miners for a transaction of a certain size.
     * @param bytes size in bytes
     */
  feeForSize (bytes: number): number {
    // TODO...
    return 100
  }

  /**
     * Must return the fee required by miners for the transaction as currently configured.
     *
     * The base class implementation computes the transaction size in bytes and applies
     * the fee rate established by the abstract `feeForSize` function.
     */
  feeRequired (): number {
    const size = transactionSize(
      this.inputs.map(x => x.scriptLength),
      this.outputs.concat(this.outputsChange).map(x => x.script.length / 2)
    )
    const fee = this.feeForSize(size)
    return fee
  }

  /**
     * Must return the current excess fee for the transaction as currently configured.
     *
     * The base class defines this as funding() - spending() - change() - requiredFee()
     *
     * Because adding an input, or output, increments the counts,
     * which are varints, compute the excess fee being paid for
     * the transaction as a whole based on current choices:
     * - inputs
     * - outputs
     * - changeOutputs
     *
     * The goal is an excess fee of zero.
     *
     * A positive value is okay if the cost of an additional change output is greater.
     *
     * A negative value means the transaction is under funded, or over spends, and may be rejected.
     */
  feeExcess (): number {
    return this.funding() - this.spending() - this.change() - this.feeRequired()
  }

  /**
     * Add outputs to transaction `outputs`.
     *
     * All outputs are added.
     *
     * @param outputs to add to transaction `outputs`
     */
  addOutputs (outputs: Array<DojoCreateTxOutputApi | DojoCreatingTxOutputApi | DojoTxBuilderOutputApi>): void {
    for (const output of outputs) {
      const o: DojoTxBuilderOutputApi = {
        satoshis: output.satoshis,
        script: output.script,
        vout: 0,
        index: 0,
        change: false
      }
      this.outputs.push(o)
    }
  }

  /**
     * Add change outputs to transaction `outputsChange`.
     *
     * All change outputs are added.
     *
     * @param outputs to add to transaction `outputsChange`
     */
  addChangeOutputs (outputs: Array<DojoCreateTxOutputApi | DojoCreatingTxOutputApi | DojoTxBuilderOutputApi>): void {
    for (const output of outputs) {
      const o: DojoTxBuilderOutputApi = {
        satoshis: output.satoshis,
        script: output.script,
        vout: 0,
        index: 0,
        change: false
      }
      this.outputsChange.push(o)
    }
  }

  /**
     * Add inputs to transaction `inputs`.
     *
     * All inputs are added.
     *
     * @param inputs to add to transaction `inputs`
     */
  addInputs (inputs: Record<string, DojoCreatingTxInputsApi>): void {
    /* */
  }

  /**
     * Add inputs sequentially to transaction `inputs` while `feeExcess` is negative.
     *
     * @param inputs to add to transaction `inputs`, removes inputs used from array
     */
  addInputsToFundOutputs (inputs: DojoTxBuilderInputApi[]): void {
    // Add inputs, while we have any, until not underfunded
    while (this.feeExcess() < 0) {
      const input = inputs.shift()
      if (input == null) break
      this.inputs.push(input)
    }
  }

  /**
     * Repeatedly calls `getChangeOutput` and adds the new returned change output
     * while `feeExcess` is positive and returned output is not undefined.
     *
     * If `getChangeOutput` returns an output that would overspend (feeExcess < 0)
     * it is not added and the function returns.
     *
     * @param getChangeOutput a function that returns a single new change output or undefined if done.
     */
  addChangeOutputsToRecoverExcessFee (getChangeOutput: () => DojoTxBuilderOutputApi | undefined): void {
    let excess = this.feeExcess()
    while (excess > 0) {
      const output = getChangeOutput()
      if (output == null) { break }
      this.outputsChange.push(output)
      excess = this.feeExcess()
      if (excess < 0) {
        // Remove the new change output if it overspends configured transaction
        this.outputsChange.pop()
        break
      }
    }
  }

  validateOutput (o: DojoCreateTxOutputApi): void {
    validateSatoshis(o.satoshis)
    validateScript(o.script)
    // eslint-disable-line @typescript-eslint/strict-boolean-expressions
    if (o.description) o.description = validateOutputDescription(o.description)
    if (o.basket) o.basket = validateTxLabel(o.basket)
    if (o.customInstructions) o.customInstructions = validateCustomInstructions(o.customInstructions)
  }

  /**
     * validate current transaction configuration
     *
     * if `ok` is true, a valid transaction can be created
     *
     * if `ok` is false, `error` is not undefined and has details one issue.
     */
  validate (noThrow = false): { ok: boolean, error: CwiError | undefined } {
    let result: { ok: boolean, error: CwiError | undefined } = { ok: true, error: undefined }

    try {
      if (!(this?.inputs.length > 0) || !(this?.outputs.length > 0)) { throw new ERR_DOJO_CREATE_TX_EMPTY() }

      for (const o of this.outputs) this.validateOutput(o)
    } catch (err) {
      if (noThrow) { result = { ok: false, error: err as CwiError } } else { throw err }
    }

    return result
  }
}
