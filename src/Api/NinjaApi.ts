import {
    Chain, CwiError, DojoAvatarApi, DojoCertificateApi, DojoClientApi, EnvelopeEvidenceApi,
    DojoGetTotalOfAmountsOptions, DojoGetTransactionOutputsOptions, DojoGetTransactionsOptions,
    MapiResponseApi, DojoTransactionStatusApi, TscMerkleProofApi, DojoPendingTxApi, DojoTxInputsApi, DojoTxInputSelectionApi, DojoCreateTxOutputApi, DojoOutputGenerationApi, DojoFeeModelApi, DojoPendingTxInputApi, DojoPendingTxOutputApi, DojoCreateTransactionResultApi, DojoProcessTransactionResultApi
} from "cwi-base"

/**
 * A client for creating, signing, and delivering Bitcoin transactions
 */
export interface NinjaApi {

    /**
     * The dojo user wallet database supporting this api.
     * 
     * isAuthenticated must be true.
     */
    dojo: DojoClientApi
    
    /**
     * Authenticates with configured dojo, if necessary.
     * 
     * @param identityKey Optional. The user's public identity key. Must be authorized to act on behalf of this user.
     * @param addIfNew Optional. Create new user records if identityKey is unknown.
     */
    authenticate(identityKey?: string, addIfNew?: boolean): Promise<void>

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
    ): Promise<{ status: 'success', certificates: DojoCertificateApi[] }>

    /**
     * Use this endpoint to store an incoming certificate.
     * @param {Object} obj All parameters are given in an object
     * @param {Object} obj.certificate The certificate object to save
     * @returns {Promise<Object>} A success object with `status: "success"`
     */
    saveCertificate(certificate: DojoCertificateApi | object): Promise<void>

    /**
     * Returns the total of unspent outputs in satoshis. A non-negative integer.
     * 
     * @param basket defaults to 'default' if undefined
     */
    getTotalValue(basket?: string): Promise<{ total: number }>

    /**
     * Returns the sum of transaction amounts belonging to authenticated user,
     * matching the given direction (which must be specified),
     * and optionally matching remaining conditions in `options`.
     */
    getTotalOfAmounts(options: DojoGetTotalOfAmountsOptions): Promise<{ total: number }>

    /**
     * Returns the net sum of transaction amounts belonging to authenticated user,
     * incoming minus outgoing,
     * and optionally matching conditions in `options`.
     */
    getNetOfAmounts(options?: DojoGetTotalOfAmountsOptions): Promise<number>

    /**
     * Returns the name and photo URL of the user
     * @returns {Promise<Avatar>} The avatar of the user
     */
    getAvatar(): Promise<DojoAvatarApi>

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
    getTransactions(options?: DojoGetTransactionsOptions): Promise<NinjaGetTransactionsResultApi>

    /**
     * Returns a set of transaction outputs that Dojo has tracked
     */
    getTransactionOutputs(options?: DojoGetTransactionOutputsOptions): Promise<NinjaGetTransactionOutputsResultApi[]>

    /**
     * Returns a set of all transactions that need to be signed and submitted, or canceled
     */
    getPendingTransactions(referenceNumber?: string): Promise<DojoPendingTxApi[]>

    /**
     * Use this endpoint to update the status of a transaction. This is useful for flagging incomplete transactions as aborted or reverting a completed transaction back into a pending status if it never got confirmed. Setting the status to "completed" or "waitingForSenderToSend" will make any selected UTXOs unavailable for spending, while any other status value will free up the UTXOs for use in other transactions.
     *
     * @param params.reference The Dojo reference number for the transaction
     * @param params.status The new status of the transaction
     */
    updateTransactionStatus(params: { reference: string, status: DojoTransactionStatusApi }): Promise<void>

    /**
     * Use this endpoint to update the status of one of your outputs, given as the TXID of a transaction and the vout (output index) in that transaction. This is useful for flagging transaction outpoints as spent if they were inadvertantly broadcasted or used without properly submitting them to the Dojo, or to undo the spending of an output if it was never actually spent.
     *
     * @param params.txid The TXID of the transaction that created the output
     * @param params.vout The index of the output in the transaction
     * @param params.spendable The true spendability status of this outpoint
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
     * @returns `DojoProcessTransactionResultApi` with txid and status of 'completed' or 'unknown'
     */
    processTransaction(params: { submittedTransaction: string | Buffer, reference: string, outputMap: Record<string, number> })
    : Promise<DojoProcessTransactionResultApi>

    /**
     * Creates and signs a transaction with specified outputs, so that it can be processed with `processTransaction`. This is a higher-level wrapper around `createTransaction` so that you do not need to manually handle signing, when you are not providing any non-Dojo inputs.
     *
     * Use this by default, and fall back to `createTransaction` if you need more customization.
     *
     * @returns `GetTxWithOutputsResult` if not autoProcess
     * @returns `GetTxWithOutputsProcessedResult` if autoProcess
     */
    getTransactionWithOutputs(params: NinjaGetTransactionWithOutputsParams): Promise<NinjaGetTxWithOutputsResultApi | NinjaGetTxWithOutputsProcessedResultApi>

    /**
     * Creates a new transaction that must be processed with `processTransaction`
     * after you sign it
     *
     *
     * @returns {Promise<TransactionTemplate>} The template you need to sign and process
     */
    createTransaction(params: NinjaCreateTransactionParams): Promise<DojoCreateTransactionResultApi>

    /**
     * This endpoint allows a recipient to submit a transactions that was directly given to them by a sender.
     * Saves the inputs and key derivation information, allowing the UTXOs to be redeemed in the future.
     * Sets the transaction to completed and marks the outputs as spendable.
     *
     */
    submitDirectTransaction(params: NinjaSubmitDirectTransactionParams) : Promise<NinjaSubmitDirectTransactionResultApi>
}

/**
 * Input parameters to createTransaction method.
 */
export interface NinjaCreateTransactionParams {
    /**
     * Specify any additional inputs to the transaction (if any) that are not to be provided by the Dojo.
     * If you do not provide inputs here, or if they are insufficient,
     * Dojo will select additional inputs for you to sign.
     * To control this input selection behavior, see the `inputSelection` parameter.
     * This `inputs` parameter is an object whose keys are TXIDs of input transactions,
     * and whose values are their associated SPV envelopes.
     */
    inputs: Record<string, DojoTxInputsApi>;
    /**
     * If Dojo needs to select more inputs beyond what you provided in the `inputs` parameter,
     * this parameter describes which kinds of inputs can be selected, and from where.
     */
    inputSelection: DojoTxInputSelectionApi;
    /**
     * External outputs that you will include when you create this transaction.
     * These outputs can contain custom scripts as specified by recipients.
     * If the inputs to the transaction go beyond what is needed to fund
     * these outputs (plus the transaction fee),
     * additional Dojo-managed UTXOs will be generated to collect
     * the remainder (see the `outputGeneration` parameter for more on this).
     */
    outputs: DojoCreateTxOutputApi[];
    /**
     * If Dojo needs to generate additional outputs for the transaction beyond what was specified,
     * this object describes what kind of outputs to generate, and where they should be kept.
     *
     * The method used to generate outputs.
     * "auto" selects the amount and types of generated outputs based on the selected basket's
     * configuration for how many of each type to keep on hand,
     * then uses Benford's law to distribute the satoshis across them.
     * "single" just uses one output, randomly selected from the available types,
     * that contains all the satoshis.
     */
    outputGeneration: DojoOutputGenerationApi;
    /**
     * When the fee model is "sat/kb", this is the number of satoshis per kilobyte of block space
     * that the transaction will pay.
     */
    fee: DojoFeeModelApi;
    /**
     * The labels to affix to this transaction
     */
    labels: string[];
    /**
     * A numan-readable note describing the transaction
     */
    note?: string;
    /**
     * The Paymail handle for the recipient of the transaction
     */
    recipient?: string;
}

export type NinjaTransactionFailedHandler = (args: NinjaTransactionFailedApi) => Promise<void>
export type NinjaTransactionProcessedHandler = (args: NinjaTransactionProcessedApi) => Promise<void>

export interface NinjaTransactionFailedApi {
    inputs: Record<string, DojoPendingTxInputApi>
    isOutgoing: boolean
    reference: string
    error: CwiError
}

export interface NinjaTransactionProcessedApi {
    inputs: Record<string, DojoPendingTxInputApi>
    outputs: DojoPendingTxOutputApi[]
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

export interface NinjaGetTransactionsTxApi {
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
export interface NinjaGetTransactionsResultApi {
    /** 
     * The number of transactions in the complete set
     */
    totalTransactions: number
    /**
     * The specific transactions from the set that were requested, based on `limit` and `offset`
     */
    transactions: NinjaGetTransactionsTxApi[]
}

/**
 *
 */
export interface NinjaGetTxWithOutputsResultApi {
    /**
     * The serialized, signed transaction that is ready for broadcast
     */
    rawTx: string
    /**
     * rawTx hash as hex string
     */
    txid: string
    /**
     * The reference number that should now be provided back to `processTransaction (or `updateTransactionStatus`)
     */
    referenceNumber: string
    /**
     * The amount of the transaction
     */
    amount: number
    /**
     * This is the fully-formed `inputs` field of this transaction, as per the SPV Envelope specification.
     */
    inputs: Record<string, EnvelopeEvidenceApi>
    /**
     * Map of change output derivationSuffix values to transaction vout indices
     */
    outputMap: Record<string, number>
}

/**
 *
 */
export interface NinjaGetTxWithOutputsProcessedResultApi {
    /**
     * The serialized, signed transaction that is ready for broadcast
     */
    rawTx: string
    /**
     * rawTx hash as hex string
     */
    txid: string
    /**
     * On 'completed' status, array of acceptance responses from mapi transaction processors.
     */
    mapiResponses: MapiResponseApi[]
    /**
     * ...
     */
    note?: string
    /**
     * The amount of the transaction
     */
    amount: number
    /**
     * This is the fully-formed `inputs` field of this transaction, as per the SPV Envelope specification.
     */
    inputs: object
}

export interface NinjaGetPendingTransactionsInstructionsApi {
    /**
     * max length of 50
     * e.g. P2PKH, custom
     */
    type: string
    /**
     * max length of 32
     * base64 encoded
     */
    derivationPrefix: string | null
    /**
     * max length of 32
     * base64 encoded
     */
    derivationSuffix: string | null
    /**
     * max length of 64
     */
    paymailHandle: string | null
    /**
     * max length of 130
     * hex encoded
     */
    senderIdentityKey: string | null
    /**
     * max length of 2500
     */
    customInstructions: string | null
}

export interface NinjaGetPendingTransactionsInputApi extends EnvelopeEvidenceApi {
    outputsToRedeem: number[]
    instructions: Record<number, NinjaGetPendingTransactionsInstructionsApi>
}

/**
 *
 */
export interface NinjaGetPendingTransactionsTxApi {
    transactionId: number
    /**
     * The time the transaction was registered with the Dojo
     */
    created_at: string
    /**
     * Is valid when transaction proof record exists in DojoProvenTxApi table.
     */
    provenTxId?: number | null
    /**
     * max length of 64
     * e.g. completed, failed, unprocessed, waitingForSenderToSend
     */
    status: DojoTransactionStatusApi
    isOutgoing: boolean
    /**
     * The number of satoshis added or removed from Dojo by this transaction
     */
    amount: number
    /**
     * The Paymail handle of the person who sent the transaction
     */
    senderPaymail: string | undefined | null
    /**
     * The Dojo reference number for the transaction
     */
    referenceNumber: string
    truncatedExternalInputs: string | null
    rawTransaction: Buffer | null
    /**
     * parsed truncatedExternalInputs
     */
    inputs?: Record<string, NinjaGetPendingTransactionsInputApi>
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
export interface NinjaGetTransactionOutputsResultApi {
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

export interface NinjaSubmitDirectTransactionOutputApi {
    vout: number,
    basket: string
    derivationPrefix?: string,
    derivationSuffix?: string,
    customInstructions?: object
}

/**
 * Transaction input parameter to submitDirectTransaction method.
 */
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

/**
 * Input parameters to submitDirectTransaction method.
 */
export interface NinjaSubmitDirectTransactionParams {
    /**
     * Specify the transaction submission payment protocol to use.
     * Currently, the only supported protocol is that with BRFC ID "3241645161d8"
     */
    protocol: string,
    /**
     * The transaction envelope to submit, including key derivation information.
     *
     * transaction.outputs is an array of outputs, each containing:
     *  `vout`,
     *  `satoshis`,
     *  `derivationSuffix`,
     *  and (optionally), `derivationPrefix`.
     *
     * If a global `derivationPrefix` is used (recommended),
     * output-specific derivation prefixes should be omitted.
     */
    transaction: NinjaSubmitDirectTransactionApi,
    /**
     * Provide the identity key for the person who sent the transaction
     */
    senderIdentityKey: string,
    /**
     * Human-readable description for the transaction
     */
    note: string,
    /**
     * Labels to assign to transaction.
     */
    labels: string[],
    /**
     * A derivation prefix used for all outputs. If provided, derivation prefixes on all outputs are optional.
     */
    derivationPrefix?: string
    amount?: number,
}

export interface NinjaSubmitDirectTransactionResultApi {
    transactionId: number
    referenceNumber: string
}

/**
 * Input parameters to getTransactionWithOutputs method.
 */
export interface NinjaGetTransactionWithOutputsParams {
    /**
     * A set of outputs to include, each with `script` and `satoshis`.
     */
    outputs: DojoCreateTxOutputApi[]
    /**
     * A set of label strings to affix to the transaction
     */
    labels?: string[]
    /**
     * Input scripts to spend as part of this transaction.
     *
     * This is an object whose keys are TXIDs and whose values are Everett-style
     * transaction envelopes that contain an additional field called `outputsToRedeem`.
     *
     * This is an array of objects, each containing `index` and `unlockingScript` properties.
     *
     * The `index` property is the output number in the transaction you are spending,
     * and `unlockingScript` is the hex scriptcode that unlocks the satoshis.
     *
     * Note that you should create any signatures with `SIGHASH_NONE | ANYONECANPAY` or similar
     * so that the additional Dojo outputs can be added afterward without invalidating your signature.
     */
    inputs?: Record<string, NinjaTxInputsApi>
    /**
     * A note about the transaction
     */
    note?: string
    /**
     * Paymail recipient for transaction
     */
    recipient?: string
    /**
     * Whether the transaction should be processed automatically
     * with processTransaction. Note that this will return `mapiResponses` and `note`
     * instead of referenceNumber
     *
     * default true
     */
    autoProcess?: boolean
    /**
     * The number of satoshis to pay per KB of block space used by this transaction.
     *
     * default 110
     */
    feePerKb?: number
}
