import { Chain, CwiError } from "cwi-base"
import { AvatarApi, CertificateApi, CreateTransactionResultApi, CreateTxOutputApi, DojoApi, DojoTxInputsApi, FeeModelApi, GetTotalOfAmountsOptions, GetTransactionOutputsOptions, GetTransactionsOptions, GetTxWithOutputsProcessedResultApi, OutputGenerationApi, PendingTxApi, PendingTxInputApi, PendingTxOutputApi, ProcessTransactionResultApi, TransactionStatusApi, TxInputSelectionApi } from "@cwi/dojo-base"
import { EnvelopeEvidenceApi, MapiResponseApi, TscMerkleProofApi } from "cwi-external-services"
import { GetTransactionsResultApi, GetTxWithOutputsResultApi, GetTransactionOutputsResultApi } from "@cwi/dojo-base"
import { SubmitDirectTransactionParams } from "../Base/submitDirectTransaction"

/**
 * A client for creating, signing, and delivering Bitcoin transactions
 */
export interface NinjaApi {

    /**
     * The dojo user wallet database supporting this api.
     * 
     * isAuthenticated must be true.
     */
    dojo: DojoApi
    
    /**
     * Return the private / public keypair used by the Ninja client for change UTXOs
     */
    getClientChangeKeyPair(): KeyPairApi

    /**
     * Returns the current Paymail handle
     */
    getPaymail(): Promise<string>

    /**
     * Changes the Paymail handle of the user.
     * 
     * NOTE that the old handle will be available for others to use.
     * 
     * NOTE that to prevent span, you may only do this if there is at least one unspent output under Dojo management.
     */
    setPaymail(paymail: string): Promise<void>

    /**
     * Returns which BSV network we are using (main or test)
     */
    getChain(): Promise<Chain>

    /**
     * Returns which BSV network we are using (mainnet or testnet)
     * @param {String} format for the returned string. Either with (default) or without (nonet) a 'net' suffix.
     * @returns {String} The current BSV network formatted as requested.
     */
    getNetwork(format?: 'default' | 'nonet'): Promise<string>

    /**
     * Use this endpoint to retrieve certificates.
     * @param {Object} obj All parameters are given in an object
     * @param {Array} obj.certifiers The certifiers to filter certificates by
     * @param {Object} obj.types The certificate types to filter certificates by
     * @returns {Promise<Object>} A success object with `status: "success"` and any found certificates
     */
    findCertificates(
        certifiers?: string[] | object,
        types?: Record<string, string[]>
    ): Promise<{ status: 'success', certificates: CertificateApi[] }>

    /**
     * Use this endpoint to store an incoming certificate.
     * @param {Object} obj All parameters are given in an object
     * @param {Object} obj.certificate The certificate object to save
     * @returns {Promise<Object>} A success object with `status: "success"`
     */
    saveCertificate(certificate: CertificateApi | object): Promise<void>

    /**
     * Returns the total of unspent outputs in satoshis. A non-negative integer.
     * 
     * @param basket defaults to 'default' if undefined
     */
    getTotalValue(basket?: string): Promise<number>

    /**
     * Returns the sum of transaction amounts belonging to authenticated user,
     * matching the given direction (which must be specified),
     * and optionally matching remaining conditions in `options`.
     */
    getTotalOfAmounts(options: GetTotalOfAmountsOptions): Promise<number>

    /**
     * Returns the net sum of transaction amounts belonging to authenticated user,
     * incoming minus outgoing,
     * and optionally matching conditions in `options`.
     */
    getNetOfAmounts(options?: GetTotalOfAmountsOptions): Promise<number>

    /**
     * Returns the name and photo URL of the user
     * @returns {Promise<Avatar>} The avatar of the user
     */
    getAvatar(): Promise<AvatarApi>

    /**
     * Sets a new name and photo URL
     * @param name A new name
     * @param photoURL A new UHRP or HTTPS URL to a photo of the user
     */
    setAvatar(name: string, photoURL: string): Promise<void>

    /**
     * Returns a set of transactions that match the criteria
     *
     * @param options limit defaults to 25, offset defaults to 0, addLabels defaults to true, order defaults to 'descending'
     */
    getTransactions(options?: GetTransactionsOptions): Promise<GetTransactionsResultApi>

    /**
       * Returns a set of transaction outputs that Dojo has tracked
       */
    getTransactionOutputs(options?: GetTransactionOutputsOptions): Promise<GetTransactionOutputsResultApi[]>

    /**
       * Returns a set of all transactions that need to be signed and submitted, or canceled
       * @returns {Promise<GetPendingTransactionsTx[]>} The array of pending transactions
       */
    getPendingTransactions(referenceNumber?: string): Promise<PendingTxApi[]>

    /**
     * Use this endpoint to update the status of a transaction. This is useful for flagging incomplete transactions as aborted or reverting a completed transaction back into a pending status if it never got confirmed. Setting the status to "completed" or "waitingForSenderToSend" will make any selected UTXOs unavailable for spending, while any other status value will free up the UTXOs for use in other transactions.
     * @param {Object} obj All parameters are given in an object
     * @param {String} obj.reference The Dojo reference number for the transaction
     * @param {String} obj.status The new status of the transaction
     * @returns {Promise<Object>} A success object with `status: "success"`
     */
    updateTransactionStatus(params: { reference: string, status: TransactionStatusApi }): Promise<void>

    /**
     * Use this endpoint to update the status of one of your outputs, given as the TXID of a transaction and the vout (output index) in that transaction. This is useful for flagging transaction outpoints as spent if they were inadvertantly broadcasted or used without properly submitting them to the Dojo, or to undo the spending of an output if it was never actually spent.
     * @param {Object} obj All parameters are given in an object
     * @param {String} obj.txid The TXID of the transaction that created the output
     * @param {Number} obj.vout The index of the output in the transaction
     * @param {Boolean} obj.spendable The true spendability status of this outpoint
     * @returns {Promise<Object>} A success object with `status: "success"`
     */
    updateOutpointStatus(params: { txid: string, vout: number, spendable: boolean }): Promise<void>

    /**
     * Signs and processes all pending transactions, useful when recovering from an
     * error or crash, or on startup. If a transaction fails to process, marks it
     * as failed.
     */
    processPendingTransactions(onTransactionProcessed?: NinjaTransactionProcessedHandler, onTransactionFailed?: NinjaTransactionFailedHandler): Promise<void>

    /**
     * After a transaction is created (with `createTransaction` or with `getTransactionWithOutputs`),
     * submit the serialized raw transaction to transaction processors for processing.
     * 
     * @param params.submittedTransaction The transaction that has been created and signed
     * @param params.reference The reference number provided by `createTransaction` or `getTransactionWithOutputs`
     * @param params.outputMap An object whose keys are derivation prefixes
     *  and whose values are corresponding change output numbers from the transaction.
     *
     * @returns `ProcessTransactionResultApi` with txid and status of 'completed' or 'unknown'
     */
    processTransaction(params: { submittedTransaction: string | Buffer, reference: string, outputMap: Record<string, number> }): Promise<ProcessTransactionResultApi>

    /**
     * Creates and signs a transaction with specified outputs, so that it can be processed with `processTransaction`. This is a higher-level wrapper around `createTransaction` so that you do not need to manually handle signing, when you are not providing any non-Dojo inputs.
     *
     * Use this by default, and fall back to `createTransaction` if you need more customization.
     *
     * @param {Object} obj All parameters are given in an object
     * @param {Authrite} obj.authriteClient An API for invoking mutually authenticated requests
     * @param {Array<GetTxWithOutputsOutput>} [obj.outputs=[]] A set of outputs to include,
     * each with `script` and `satoshis`.
     * @param {Number} [obj.feePerKb=110] The number of satoshis to pay per KB of block space used by this transaction.
     * @param {Array<String>} [obj.labels=[]] A set of label strings to affix to the transaction
     * @param {Object} [obj.inputs={}] Input scripts to spend as part of this transaction.
     * This is an object whose keys are TXIDs and whose values are Everett-style
     * transaction envelopes that contain an additional field called `outputsToRedeem`.
     * This is an array of objects, each containing `index` and `unlockingScript` properties.
     * The `index` property is the output number in the transaction you are spending,
     * and `unlockingScript` is the hex scriptcode that unlocks the satoshis.
     * Note that you should create any signatures with `SIGHASH_NONE | ANYONECANPAY` or similar
     * so that the additional Dojo outputs can be added afterward without invalidating your signature.
     * @param {Boolean} [obj.autoProcess=true] Whether the transaction should be processed automatically
     * with processTransaction. Note that this will return `mapiResponses` and `note`
     * instead of referenceNumber
     * @param {String} [obj.recipient] Paymail recipient for transaction
     * @param {String} [obj.note] A note about the transaction
     *
     * @returns `GetTxWithOutputsResult` if not autoProcess
     * @returns `GetTxWithOutputsProcessedResult` if autoProcess
     */
    getTransactionWithOutputs(params: {
        outputs: CreateTxOutputApi[],
        labels: string[],
        inputs: Record<string, NinjaTxInputsApi>,
        note: string,
        recipient: string,
        autoProcess?: boolean, // default true
        feePerKb?: number // default 110
    }): Promise<GetTxWithOutputsResultApi | GetTxWithOutputsProcessedResultApi>

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
    createTransaction(params: {
        inputs: Record<string, DojoTxInputsApi>,
        inputSelection: TxInputSelectionApi,
        outputs: CreateTxOutputApi[],
        outputGeneration: OutputGenerationApi,
        fee: FeeModelApi,
        labels: string[],
        note?: string,
        recipient?: string
    }): Promise<CreateTransactionResultApi>




    /**
     * This endpoint allows a recipient to submit a transactions that was directly given to them by a sender.
     * Saves the inputs and key derivation information, allowing the UTXOs to be redeemed in the future.
     * Sets the transaction to completed and marks the outputs as spendable.
     *
     * @param {Object} obj All parameters are given in an object
     * @param {string} obj.protocol Specify the transaction submission payment protocol to use.
     *  Currently, the only supported protocol is that with BRFC ID "3241645161d8"
     * @param {Object} obj.transaction The transaction envelope to submit, including key derivation information.
     * @param {Array} obj.transaction.outputs An array of outputs, each containing:
     *  `vout`,
     *  `satoshis`,
     *  `derivationSuffix`,
     *  and (optionally), `derivationPrefix`.
     *  If a global `derivationPrefix` is used (recommended), output-specific derivation prefixes should be omitted.
     * @param {string} obj.senderIdentityKey Provide the identity key for the person who sent the transaction
     * @param {string} obj.note Human-readable description for the transaction
     * @param {string} [obj.derivationPrefix] A derivation prefix used for all outputs.
     * If provided, derivation prefixes on all outputs are optional.
     *
     * @returns {Promise<Object>} Object containing
     *  reference number,
     *  status=success,
     *  note: human-readable, acknowledging the transaction
     */
    submitDirectTransaction(params: SubmitDirectTransactionParams) : Promise<string>

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

}

export type NinjaTransactionFailedHandler = (args: NinjaTransactionFailedApi) => Promise<void>
export type NinjaTransactionProcessedHandler = (args: NinjaTransactionProcessedApi) => Promise<void>

export interface NinjaTransactionFailedApi {
    inputs: Record<string, PendingTxInputApi>
    isOutgoing: boolean
    reference: string
    error: CwiError
}

export interface NinjaTransactionProcessedApi {
    inputs: Record<string, PendingTxInputApi>
    outputs: PendingTxOutputApi[]
    isOutgoing: boolean
    reference: string
    txid: string
    amount: number
    hex: string
    derivationPrefix?: string
    senderIdentityKey?: string
}

export interface NinjaOutputToRedeemApi {
    /**
     * Zero based output index within its transaction to spend.
     */
    index: number,
    /**
     * Hex scriptcode that unlocks the satoshis.
     *
     * Note that you should create any signatures with `SIGHASH_NONE | ANYONECANPAY` or similar
     * so that the additional Dojo outputs can be added afterward without invalidating your signature.
     */
    unlockingScript: string,
    spendingDescription?: string
}

export interface NinjaTxInputsApi extends EnvelopeEvidenceApi {
    outputsToRedeem: NinjaOutputToRedeemApi[]
}

export interface KeyPairApi {
    privateKey: string
    publicKey: string
}

export interface NinjaSubmitDirectTransactionOutputApi {
    vout: number,
    basket: string
    derivationPrefix?: string,
    derivationSuffix?: string,
    customInstructions?: object
}

export interface NinjaSubmitDirectTransactionApi {
    rawTx: string
    inputs?: Record<string, EnvelopeEvidenceApi>
    mapiResponses?: MapiResponseApi[]
    proof?: TscMerkleProofApi
    /**
     * sparse array of outputs of interest where indices match vout numbers.
     */
    outputs: NinjaSubmitDirectTransactionOutputApi[]
    referenceNumber?: string
}

export interface NinjaSubmitDirectTransactionResultApi {
    transactionId: number
    referenceNumber: string
}