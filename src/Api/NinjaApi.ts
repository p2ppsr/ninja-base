import { Chain } from "@cwi/base"
import { CertificateApi, DojoApi, GetTotalOfAmountsOptions, GetTransactionsOptions, TransactionApi, TransactionStatusApi } from "@cwi/dojo-base"
import { EnvelopeApi } from "@cwi/external-services"

export interface AvatarApi {
    /**
     * The name of the user
     */
    name: string
    /**
     * An HTTPS or UHRP URL to a photo of the user
     */
    photoURL: string
}

export interface GetTransactionsTxApi {
    /**
     * The transaction ID
     */
    txid: string
    /**
     * The number of satoshis added or removed from Dojo by this transaction
     */
    amount: number
    /**
     * The current state of the transaction. Common statuses are `completed` and `waitingForSenderToSend`.
     */
    status: string
    /**
     * The Paymail handle of the person who sent the transaction
     */
    senderPaymail: string
    /**
     * The Paymail handle of the person who received the transaction
     */
    recipientPaymail: string
    /**
     * Whether or not the transaction was created with `createTransaction`
     */
    isOutgoing: boolean
    /**
     * The human-readable tag for the transaction, provided by the person who initiated it
     */
    note: string
    /**
     * The time the transaction was registered with the Dojo
     */
    created_at: string
    /**
     * The Dojo reference number for the transaction
     */
    referenceNumber: string
    /**
     * A set of all the labels affixed to the transaction
     */
    labels: string[]
}

/**
 *
 */
export interface GetTransactionsResultApi {
    /** 
     * The number of transactions in the complete set
     */
    totalTransactions: number
    /**
     * The specific transactions from the set that were requested, based on `limit` and `offset`
     */
    transactions: GetTransactionsTxApi[]
}

/**
 *
 */
export interface GetTxWithOutputsOutputApi {
    /**
     * The hex representing the locking script of the output
     */
    script: string
    /**
     * The number of satoshis to put in the output
     */
    satoshis: number
}

/**
 *
 */
export interface GetTxWithOutputsResultApi {
    /**
     * The serialized, signed transaction that is ready for broadcast
     */
    rawTx: string
    /**
     * The reference number that should now be provided back to `processTransaction (or `updateTransactionStatus`)
     */
    referenceNumber: string
    /**
     * This is the fully-formed `inputs` field of this transaction, as per the SPV Envelope specification.
     */
    inputs: object
    /**
     * The amount of the transaction
     */
    amount: number
}

/**
 *
 */
export interface GetPendingTransactionsTxApi {
    /**
     * The number of satoshis added or removed from Dojo by this transaction
     */
    amount: number
    /**
     * The Paymail handle of the person who sent the transaction
     */
    senderPaymail: string
    /**
     * The time the transaction was registered with the Dojo
     */
    created_at: string
    /**
     * The Dojo reference number for the transaction
     */
    referenceNumber: string
}

/**
 *
 */
export interface TxRedeemableOutputApi {
    /**
     * The index of the output to redeem in the transaction
     */
    index: number
    /**
     * The byte length of the unlocking script you intend to use to unlock this output
     */
    unlockingScriptLength: number
}

/**
 *
 */
export interface TxOutputApi {
    /**
     * The amount of satoshis that will be in the output
     */
    satoshis: number
    /**
     * The hex string representing the output locking script
     */
    script: string
}

/**
 *
 */
export interface InputTemplateApi {
    /**
     * Identifies the provider(s) of the output(s) to redeem trom the associated transaction.
     * Can be "dojo", "you" (for externally-provided inputs), or "you-and-dojo"
     */
    providedBy: string
    /**
     * A set of numbers indicating the index of each output that should be redeemed from this transaction
     */
    outputsToRedeem: number[]
    /**
     * As specified in the SPV envelope specification, the serialized transaction is provided
     */
    rawTx: string
    /**
     * When "providedBy" is "dojo" or "you-and-dojo", this is an object whose keys are numbers (from "outputsToRedeem") that correspond to Dojo-provided inputs
     * instructions[outputIndex] This is an object that gives you instructions on how to sign a Dojo-provided input. It contains the type (P2PKH or P2RPH) and derivation path (from your root XPRIV key) of the key that unlocks the input
     * instructions[outputIndex].type The type of the unlocking script you will need to produce with the key given by the derivation path
     * instructions[outputIndex].derivationPath The derivation path (from your root XPRIV key) that will give you the key that you can use to create the unlocking script
     */
    instructions: object
}

/**
 *
 */
export interface OutputTemplateApi {
    /**
     * The number of satoshis that will be put into this output
     */
    satoshis: number
    /**
     * The hex string representing the output script
     */
    script: string
    /**
     * Who is responsible for this output - Either "you" or "dojo"
     */
    providedBy: string
    /**
     * When the output is provided by Dojo, its purpose can either be "change" or "service-charge"
     */
    purpose: string
    /**
     * When the output is provided by Dojo, this indicates which basket it is destined for
     */
    destinationBasket: string
}

/**
 *
 */
export interface TransactionTemplateApi {
    /**
     * The reference number you will use to either process the transaction (with `processTransaction`) or cancel it (with `updateTransactionStatus`).
     */
    referenceNumber: string
    /**
     * The set of input templates for this transaction. This is an object whose keys are TXIDs and whose values are InputTemplate objects.
     */
    inputs: InputTemplateApi
    /**
     * The set of output templates to include in this transaction
     */
    outputs: OutputTemplateApi[]
}

/**
 * An SPV envelope object for the associated TXID.
 * 
 * See the SPV envelopes specification for details,
 * or use [hashwrap](https://www.npmjs.com/package/hash-wrap) to generate an envelope with the TXID.
 * 
 * In addition to the fields documented here, other fields from the Envelope specification are required.
 */
export interface TxInputEnvelopeApi {
    /**
     * The serialized hex of the transaction
     */
    rawTx: string
    /**
     * As specified by SPV Envelope
     */
    inputs: object
    /**
     * As specified by SPV Envelope
     */
    mapiResponses: object[]
    /**
     * As specified by SPV Envelope
     */
    proof: object
    /**
     * In addition to the fields for a normal envelope, this is used to indicate the outputs in the transaction that you are redeeming here.
     */
    outputsToRedeem: TxRedeemableOutputApi[]
}

/**
 *
 */
export interface TransactionOutputDescriptorApi {
    /**
     * Transaction ID of transaction that created the output
      */
    txid: string
    /**
     * Index in the transaction of the output
     */
    vout: number
    /**
     * Number of satoshis in the output
     */
    amount: number
    /**
     * Hex representation of output locking script
     */
    outputScript: string
    /**
     * The type of output, for example "P2PKH" or "P2RPH"
     */
    type: string
    /**
     * Whether this output is free to be spent
     */
    spendable: boolean
}

/**
 * A client for creating, signing, and delivering Bitcoin transactions
 */
export interface NinjaApi {

    /**
     * The dojo user wallet database supporting this api.
     */
    dojo: DojoApi
    
    /**
     * Returns the current Paymail handle
     */
    getPaymail(): Promise<string>

    /**
     * Changes the Paymail handle of the user. NOTE that the old handle will be available for others to use. NOTE that to prevent span, you may only do this if there is at least one unspent output under Dojo management.
     */
    setPaymail(paymail: string): Promise<void>

    /**
     * Returns the name and photo URL of the user
     * @returns {Promise<Avatar>} The avatar of the user
     */
    getAvatar(): Promise<{ name: string, photoURL: string }>

    /**
     * Sets a new name and photo URL
     * @param name A new name
     * @param photoURL A new UHRP or HTTPS URL to a photo of the user
     */
    setAvatar(name: string, photoURL: string): Promise<void>

    /**
     * Returns a set of transactions that match the criteria
     */
    getTransactions(options?: GetTransactionsOptions): Promise<{ txs: TransactionApi[], total: number }>

    /**
     * Returns a set of all transactions that need to be signed and submitted, or canceled
     * @returns {Promise<GetPendingTransactionsTx[]>} The array of pending transactions
     */
    getPendingTransactions(referenceNumber?: string): Promise<GetPendingTransactionsTxApi[]>

    /**
     * Returns the sum of transaction amounts belonging to authenticated user,
     * matching the given direction,
     * and optionally matching conditions in `options`.
     */
    getTotalOfAmounts(direction: 'incoming' | 'outgoing', options?: GetTotalOfAmountsOptions): Promise<number>

    /**
     * Returns the net sum of transaction amounts belonging to authenticated user,
     * incoming minus outgoing,
     * and optionally matching conditions in `options`.
     */
    getNetOfAmounts(options?: GetTotalOfAmountsOptions): Promise<number>

    /**
     * Returns the total of unspent outputs in satoshis. A non-negative integer.
     */
    getTotalValue(): Promise<number>

    /**
   * Creates and signs a transaction with specified outputs, so that it can be processed with `processTransaction`. This is a higher-level wrapper around `createTransaction` so that you do not need to manually handle signing, when you are not providing any non-Dojo inputs.
   *
   * Use this by default, and fall back to `createTransaction` if you need more customization.
   *
   * @param {Object} obj All parameters are given in an object
   * @param {Authrite} obj.authriteClient An API for invoking mutually authenticated requests
   * @param {Array<GetTxWithOutputsOutput>} [obj.outputs=[]] A set of outputs to include, each with `script` and `satoshis`.
   * @param {Number} [obj.feePerKb=110] The number of satoshis to pay per KB of block space used by this transaction.
   * @param {Array<String>} [obj.labels=[]] A set of label strings to affix to the transaction
   * @param {Object} [obj.inputs={}] Input scripts to spend as part of this transaction. This is an object whose keys are TXIDs and whose values are Everett-style transaction envelopes that contain an additional field called `outputsToRedeem`. This is an array of objects, each containing `index` and `unlockingScript` properties. The `index` property is the output number in the transaction you are spending, and `unlockingScript` is the hex scriptcode that unlocks the satoshis. Note that you should create any signatures with `SIGHASH_NONE | ANYONECANPAY` or similar so that the additional Dojo outputs can be added afterward without invalidating your signature.
   * @param {Boolean} [obj.autoProcess=true] Whether the transaction should be processed automatically with processTransaction. Note that this will return `mapiResponses` and `note` instead of referenceNumber
   * @param {String} [obj.recipient] Paymail recipient for transaction
   * @param {String} [obj.note] A note about the transaction
   * @returns {Promise<GetTxWithOutputsResult>} The serialized transaction, inputs, reference number and amount
  */
    getTransactionWithOutputs(
        outputs: { script: string, satoshis: number }[],
        labels: string[],
        inputs: Record<string, EnvelopeApi>,
        note: string,
        recipient: string,
        autoProcess?: boolean, // default true
        feePerKb?: number // default 110
    ): Promise<GetTxWithOutputsResultApi>

    /**
     * Creates a new transaction that must be processed with `processTransaction`
     * after you sign it
     *
     * @param {Object} obj All parameters are given in an object
     * @param {Object<TxInputEnvelope>} [obj.inputs] Specify any additional inputs
     *                 to the transaction (if any) that are not to be provided by
     *                 the
     *                 Dojo. If you do not provide inputs here, or if they are
     *                 insufficient, Dojo will select additional inputs for you to
     *                 sign. To control this input selection behavior, see the
     *                 `inputSelection` parameter. This `inputs` parameter is an
     *                 object whose keys are TXIDs of input transactions, and whose
     *                 values are their associated SPV envelopes.
     * @param {Object} [obj.inputSelection] If Dojo needs to select more inputs
     *                 beyond what you provided in the `inputs` parameter, this
     *                 parameter describes which kinds of inputs can be selected,
     *                 and from where.
     * @param {Boolean} [obj.inputSelection.disable] This is a boolean that, when
     *                 true, will forbid Dojo from adding any additional inputs to
     *                 your transaction, beyond what you specified in the `inputs`
     *                 parameter. Thus, if you have not sufficiently funded the
     *                 transaction yourself, or if `inputs` is empty, you will get
     *                 an error.
     * @param {Number} [obj.inputSelection.maxUnconfirmedChainLength] An integer
     *                 representing the maximum length for any chain of unconfirmed
     *                 parents that a selected input can have. When -1 (the
     *                 default), no maximum is specified. Cannot be zero. When 1,
     *                 indicates that the input must itself be confirmed. When 2,
     *                 input parents must be confirmed. 3 denotes grandparents, 4
     *                 great-grandparents and so forth.
     * @param {Array<TxOutput>} [obj.outputs] External outputs that you will
     *                 include when you create this transaction. These outputs can
     *                 contain custom scripts as specified by recipients. If the
     *                 inputs to the transaction go beyond what is needed to fund
     *                 these outputs (plus the transaction fee), additional
     *                 Dojo-managed UTXOs will be generated to collect the
     *                 remainder (see the `outputGeneration` parameter for more on
     *                 this).
     * @param {Object} [obj.outputGeneration] If Dojo needs to generate additional
     *                 outputs for the transaction beyond what was specified, this
     *                 object describes what kind of outputs to generate, and where
     *                 they should be kept.
     * @param {String} [obj.outputGeneration.method=auto] The method used to
     *                 generate outputs. "auto" selects the amount and types of
     *                 generated outputs based on the selected basket's
     *                 configuration for how many of each type to keep on hand,
     *                 then uses Benford's law to distribute the satoshis across
     *                 them. "single" just uses one output, randomly selected from
     *                 the available types, that contains all the satoshis.
     * @param {Object} [obj.fee] Represents the fee the transaction will pay
     * @param {String} [obj.fee.model=sat/kb] Fee model to use, currently always
     *                 "sat/kb"
     * @param {Number} [obj.fee.value=500] When the fee model is "sat/kb", this is
     *                 the number of satoshis per kilobyte of block space that the
     *                 transaction will pay.
     * @param {Array<String>} [obj.labels] The labels to affix to this transaction
     * @param {String} [obj.note] A numan-readable note describing the transaction
     * @param {String} [obj.recipient] The Paymail handle for the recipient of the transaction
     *
     * @returns {Promise<TransactionTemplate>} The template you need to sign and process
     */
    createTransaction({
        inputs,
        inputSelection,
        outputs,
        outputGeneration,
        fee,
        labels,
        note,
        recipient
    }): Promise<TransactionTemplateApi>

    /**
     * Returns which BSV network we are using (mainnet or testnet)
     * @param {String} format for the returned string. Either with or without a 'net' suffix.
     * @returns {String} The current BSV network formatted as requested.
     */
    getNetwork(format?: 'default'): string

    /**
     * Returns which BSV network we are using (main or test)
     */
    getChain(): Chain

    /**
     * After a transaction is created (with `createTransaction` or with `getTransactionWithOutputs`) this is used to process the transaction, thereby activating any change outputs and flagging designated inputs as spent
     * @param {Object} obj All parameters are given in an object
     * @param {String} obj.inputs Inputs to spend as part of this transaction
     * @param {String} obj.submittedTransaction The transaction that has been created and signed
     * @param {String} obj.reference The reference number provided by `createTransaction` or `getTransactionWithOutputs`
     * @param {Object} obj.outputMap An object whose keys are derivation prefixes and whose values are corresponding change output numbers from the transaction.
     * @returns {Promise<Object>} An object containing a `note` field with a success message, and `mapiResponses`, for use in creating an SPV Envelope
     */
    processTransaction({ inputs, submittedTransaction, reference, outputMap }): Promise<void>

    /**
   * Signs and processes all pending transactions, useful when recovering from an
   * error or crash, or on startup. If a transaction fails to process, marks it
   * as failed.
   * @param {Object} obj All parameters are given in an object
   * @param {Function} [obj.onTransactionProcessed] A function called for each processed transaction.
   * @param {Function} [obj.onTransactionFailed] A function called for each failed transaction.
   * @returns {Promise} Resolves once the operation is complete
   */
    processPendingTransactions(onTransactionProcessed?: () => void, onTransactionFailed?: () => void): Promise<void>

    /**
     * Returns a set of transaction outputs that Dojo has tracked
     * @param {Object} obj All parameters are given in an object
     * @param {String} [obj.basket] If provided, indicates which basket the outputs should be selected from.
     * @param {Boolean} [obj.tracked] If provided, only outputs with the corresponding tracked value will be returned (true/false).
     * @param {Boolean} [obj.includeEnvelope] If provided, returns a structure with the SPV envelopes for the UTXOS that have not been spent.
     * @param {Boolean} [obj.spendable] If given as true or false, only outputs that have or have not (respectively) been spent will be returned. If not given, both spent and unspent outputs will be returned.
     * @param {String} [obj.type] If provided, only outputs of the specified type will be returned. If not provided, outputs of all types will be returned.
     * @param {Number} [obj.limit] Provide a limit on the number of outputs that will be returned.
     * @param {Number} [obj.offset] Provide an offset into the list of outputs.
     * @returns {Promise<Array<TransactionOutputDescriptor>>} A set of outputs that match the criteria
     */
    getTransactionOutputs({
        basket,
        tracked,
        includeEnvelope = false,
        spendable,
        type,
        limit = 25,
        offset = 0
    }): Promise<TransactionOutputDescriptorApi>

    /**
     * Use this endpoint to update the status of a transaction. This is useful for flagging incomplete transactions as aborted or reverting a completed transaction back into a pending status if it never got confirmed. Setting the status to "completed" or "waitingForSenderToSend" will make any selected UTXOs unavailable for spending, while any other status value will free up the UTXOs for use in other transactions.
     * @param {Object} obj All parameters are given in an object
     * @param {String} obj.reference The Dojo reference number for the transaction
     * @param {String} obj.status The new status of the transaction
     * @returns {Promise<Object>} A success object with `status: "success"`
     */
    updateTransactionStatus(reference: string, status: TransactionStatusApi): Promise<void>

    /**
     * This endpoint allows a recipient to submit a transactions that was directly given to them by a sender. Saves the inputs and key derivation information, allowing the UTXOs to be redeemed in the future. Sets the transaction to completed and marks the outputs as spendable.
     *
     * @param {Object} obj All parameters are given in an object
     * @param {string} obj.protocol Specify the transaction submission payment protocol to use. Currently, the only supported protocol is that with BRFC ID "3241645161d8"
     * @param {Object} obj.transaction The transaction envelope to submit, including key derivation information
     * @param {Array} obj.transaction.outputs An array of outputs, each containing `vout`, `satoshis`, `derivationSuffix`, and (optionally), `derivationPrefix`. If a global `derivationPrefix` is used (recommended), output-specific derivation prefixes should be omitted.
     * @param {string} obj.senderIdentityKey Provide the identity key for the person who sent the transaction
     * @param {string} obj.note Human-readable description for the transaction
     * @param {string} [obj.derivationPrefix] A derivation prefix used for all outputs. If provided, derivation prefixes on all outputs are optional.
     *
     * @returns {Promise<Object>} Object containing reference number, status=success, and human-readable note acknowledging the transaction
     */
    submitDirectTransaction({
        protocol,
        transaction,
        senderIdentityKey,
        note,
        amount,
        labels,
        derivationPrefix
    }): Promise<string>

    /**
     * Verifies an incoming Paymail transaction (deprecated, use submitDirectTransaction)
     * @param {Object} obj
     * @param {string} obj.senderPaymail
     * @param {string} obj.senderIdentityKey
     * @param {string} obj.referenceNumber
     * @param {string} obj.description
     * @returns {Promise<Boolean>} A success boolean status
     */
    verifyIncomingTransaction({
        senderPaymail,
        senderIdentityKey,
        referenceNumber,
        description,
        amount
    }): Promise<boolean>

    /**
     * Use this endpoint to update the status of one of your outputs, given as the TXID of a transaction and the vout (output index) in that transaction. This is useful for flagging transaction outpoints as spent if they were inadvertantly broadcasted or used without properly submitting them to the Dojo, or to undo the spending of an output if it was never actually spent.
     * @param {Object} obj All parameters are given in an object
     * @param {String} obj.txid The TXID of the transaction that created the output
     * @param {Number} obj.vout The index of the output in the transaction
     * @param {Boolean} obj.spendable The true spendability status of this outpoint
     * @returns {Promise<Object>} A success object with `status: "success"`
     */
    updateOutpointStatus(txid: string, vout: number, spendable: boolean): Promise<void>

    /**
     * Use this endpoint to store an incoming certificate.
     * @param {Object} obj All parameters are given in an object
     * @param {Object} obj.certificate The certificate object to save
     * @returns {Promise<Object>} A success object with `status: "success"`
     */
    saveCertificate(certificate: CertificateApi): Promise<void>

    /**
     * Use this endpoint to retrieve certificates.
     * @param {Object} obj All parameters are given in an object
     * @param {Array} obj.certifiers The certifiers to filter certificates by
     * @param {Object} obj.types The certificate types to filter certificates by
     * @returns {Promise<Object>} A success object with `status: "success"` and any found certificates
     */
    findCertificates(certifiers?: string[], types?: string[]): Promise<CertificateApi[]>
}