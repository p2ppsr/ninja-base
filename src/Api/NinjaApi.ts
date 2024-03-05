import { GetTransactionOutputResult, SubmitDirectTransaction, SubmitDirectTransactionOutput, SubmitDirectTransactionResult } from '@babbage/sdk-ts'
import {
  Chain, CwiError, DojoAvatarApi, DojoCertificateApi, DojoClientApi, EnvelopeEvidenceApi,
  DojoGetTotalOfAmountsOptions, DojoGetTransactionOutputsOptions, DojoGetTransactionsOptions,
  MapiResponseApi, DojoTransactionStatusApi, TscMerkleProofApi, DojoPendingTxApi, DojoTxInputsApi,
  DojoTxInputSelectionApi, DojoCreateTxOutputApi, DojoOutputGenerationApi, DojoFeeModelApi,
  DojoPendingTxInputApi, DojoPendingTxOutputApi, DojoCreateTransactionResultApi,
  DojoProcessTransactionResultApi, SyncDojoConfigBaseApi, DojoSyncOptionsApi,
  EnvelopeApi, DojoTransactionApi, DojoGetTransactionLabelsOptions,
  DojoTxLabelApi, DojoProcessTransactionParams
} from 'cwi-base'

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
      * Sync's the dojo's state for the authenticated user with all of the configured syncDojos
      *
      * This method should only be called when either a local or remote state change occurs, or may have occurred.
      *
      * User state changes are propagated across all configured syncDojos.
      *
      */
   sync(): Promise<void>

   /**
    * Sets the syncDojo's to be used by all users by the `sync()` function.
    * 
    * Each syncDojo config has the following properties:
    * 
    * 'dojoType' one of 'Cloud URL' | 'Sqlite File' | 'MySql Connection'
    * 'dojoIdentityKey' the identity key of the syncDojo.
    * 'dojoName' the name of the syncDojo.
    * 
    * Currently supports three syncDojo configurations, each identified by its dojoType:
    * 
    * 'Sqlite File'
    *   The derived `SyncDojoConfigSqliteFile` interface adds:
    *   'filename' will be passed to Knex Sqlite3 to configure a locally accessible, single user Sqlite database.
    *   If the database exists, it must already be configured with matching dojoIdentityKey.
    *   If the database does not exist and can be created, it will be configured with the specified dojoIdentityKey.
    *
    * 'MySql Connection'
    *   The derived `SyncDojoConfigMySqlConnection` interface adds:
    *   'connection', a stringified MySql connection object, will be passed to Knex MySql to access a network
    *   accessible, possibly shared, MySql database.
    *   The database must exists and must already be configured with matching dojoIdentityKey.
    *
    * 'Cloud URL'
    *   The derived `SyncDojoConfigCloudUrl` interface adds:
    *   'url' the service URL of the cloud dojo with which to sync
    *   'clientPrivateKey' should be set to the string value 'true' to enable automatic use of Authrite as the authenticated user.
    *   'useIdentityKey' may be set to true instead of using 'clientPrivateKey' if the cloud dojo does not use Authrite for access control.
    *   The cloud dojo must exists and must already be configured with matching dojoIdentityKey.
    * 
    * @param syncDojoConfigs array of syncDojos to be used. May be empty.
    * @param options place holder for future synchronization control options.
    * @throws ERR_BAD_REQUEST if dojo's syncDojos are managed directly, e.g. `DojoExpressClient`
    * @throws ERR_BAD_REQUEST if an attempt to set a `<custom>` sync dojo.
    */
   setSyncDojosByConfig(syncDojoConfigs: SyncDojoConfigBaseApi[], options?: DojoSyncOptionsApi): Promise<void>

   /**
    * Gets the currently configured syncDojos and sync options.
    * 
    * If syncDojos are not being managed by `setSyncDojosByConfig` the returned configurations may include
    * a 'dojoType' of '<custom>'.
    */
   getSyncDojosByConfig(): Promise<{ dojos: SyncDojoConfigBaseApi[], options?: DojoSyncOptionsApi }>

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
      * Returns transaction labels matching options and total matching count available.
      *
      * @param options limit defaults to 25, offset defaults to 0, order defaults to 'descending'
      */
   getTransactionLabels(options?: DojoGetTransactionLabelsOptions): Promise<{ labels: DojoTxLabelApi[], total: number }>

   /**
      * Returns a set of all transactions that need to be signed and submitted, or canceled
      */
   getPendingTransactions(referenceNumber?: string): Promise<DojoPendingTxApi[]>

   /**
      * Use this endpoint to update the status of a transaction. This is useful for flagging incomplete transactions as aborted
      * or reverting a completed transaction back into a pending status if it never got confirmed. Setting the status to "completed"
      * or "unproven" will make any input UTXOs unavailable for spending,
      * while any other status value will free up the UTXOs for use in other transactions.
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
      * @returns `DojoProcessTransactionResultApi` with txid and status of 'completed' or 'unknown'
      */
   processTransaction(params: DojoProcessTransactionParams): Promise<DojoProcessTransactionResultApi>

   /**
      * Creates and signs a transaction with specified outputs and (by default) processes it.
      * 
      * By setting `params.autoProcess` to false, it can be processed later with `processTransaction`.
      * 
      * If `params.autoProcess` is true (the default), `processTransaction` is called automatically
      * and merged results are returned.
      *
      * This is a higher-level wrapper around `createTransaction` so that you do not need to manually handle signing,
      * when you are not providing any non-Dojo inputs.
      *
      * Consider using either createTransactionWithOutputs or processTransactionWithOutputs
      * when `params.autoProcess` does not need to change at runtime.
      * 
      * Use this by default, and fall back to `createTransaction` if you need more customization.
      */
   getTransactionWithOutputs(params: NinjaGetTransactionWithOutputsParams): Promise<NinjaTransactionWithOutputsResultApi>

   /**
      * This method is equivalent to `getTransactionWithOutputs` with `params.autoProcess` false.
      * This function ignores `params.autoProcess`
      *
      * Creates and signs a transaction with specified outputs.
      * 
      * It can be processed later with `processTransaction`.
      * 
      *
      * This is a higher-level wrapper around `createTransaction` so that you do not need to manually handle signing,
      * when you are not providing any non-Dojo inputs.
      *
      * Use this by default, and fall back to `createTransaction` if you need more customization.
      */
   createTransactionWithOutputs(params: NinjaGetTransactionWithOutputsParams): Promise<NinjaTransactionWithOutputsResultApi>

   /**
      * This method is equivalent to `getTransactionWithOutputs` with `params.autoProcess` true.
      * This function ignores `params.autoProcess`
      *
      * Creates and signs a transaction with specified outputs and processes it.
      *
      * This is a higher-level wrapper around `createTransaction` and `processTransaction`
      * so that you do not need to manually handle signing, when you are not providing any non-Dojo inputs.
      * Use this by default, and fall back to `createTransaction` if you need more customization.
      */
   processTransactionWithOutputs(params: NinjaGetTransactionWithOutputsParams): Promise<NinjaTransactionWithOutputsResultApi>

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
      */
   submitDirectTransaction(params: NinjaSubmitDirectTransactionParams): Promise<NinjaSubmitDirectTransactionResultApi>

   /**
    * Soft deletes a certificate.
    *
    * @param partial The partial certificate data identifying the certificate to soft delete.
    */
   deleteCertificate(partial: Partial<DojoCertificateApi>): Promise<number>;

   /**
    * Labels a transaction
    * 
    * Validates user is authenticated, txid matches an exsiting user transaction, and label value.
    * 
    * Creates new label if necessary.
    * 
    * Adds label to transaction if not already labeled.
    * Note: previously if transaction was already labeled, an error was thrown.
    * 
    * @param txid unique transaction identifier, either transactionId, txid, or a partial pattern.
    * @param label the label to be added, will be created if it doesn't already exist
    */

   labelTransaction(txid: string | number | Partial<DojoTransactionApi>, label: string): Promise<void>

   /**
    * Removes a label from a transaction
    * 
    * Validates user is authenticated, txid matches an exsiting user transaction, and label already exits.
    * 
    * Does nothing if transaction is not labeled.
    * 
    * @param txid unique transaction identifier, either transactionId, txid, or a partial pattern.
    * @param label the label to be removed
    */
   unlabelTransaction(txid: string | number | Partial<DojoTransactionApi>, label: string): Promise<void>

   /**
    * Tags an output
    * 
    * Validates user is authenticated, partial identifies a single output, and tag value.
    * 
    * Creates new tag if necessary.
    * 
    * Adds tag to output if not already tagged.
    * 
    * @param partial unique output identifier as a partial pattern. 
    * @param tag the tag to add, will be created if it doesn't already exist
    */
   tagOutput(output: { txid: string, vout: number }, tag: string): Promise<void>

   /**
    * Removes a tag from an output
    * 
    * Validates user is authenticated, partial identifies a single output, and tag already exits.
    * 
    * Does nothing if output is not tagged.
    * 
    * @param partial unique output identifier as a partial pattern. 
    * @param tag the tag to be removed from the output
    */
   untagOutput(output: { txid: string, vout: number }, tag: string): Promise<void>

   /**
    * Removes the uniquely identified output's basket assignment.
    * 
    * The output will no longer belong to any basket.
    * 
    * This is typically only useful for outputs that are no longer usefull.
    *
    */
   unbasketOutput(output: { txid: string, vout: number }): Promise<void>

   /**
    * Returns array of Everett Style envelopes for transactions that spend one or
    * more of the inputs to transaction with `txid`, which must exist in Dojo.
    * 
    * This method supports double spend resolution.
    * 
    * @param txid  double hash of raw transaction as hex string
    */
   getEnvelopesOfConflictingTransactions(txid: string): Promise<EnvelopeApi[]>

   /**
    * Returns the current chain height of the network
    * @returns The current chain height
    */
   getHeight() : Promise<number>

   /**
    * A method to verify the validity of a Merkle root for a given block height.
    *
    * @returns merkle root for the given height or undefined, if height doesn't have a known merkle root or is invalid.
   */
   getMerkleRootForHeight(args: { height: number }): Promise<string | undefined>
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
  inputs: Record<string, DojoTxInputsApi>
  /**
     * If Dojo needs to select more inputs beyond what you provided in the `inputs` parameter,
     * this parameter describes which kinds of inputs can be selected, and from where.
     */
  inputSelection?: DojoTxInputSelectionApi
  /**
     * External outputs that you will include when you create this transaction.
     * These outputs can contain custom scripts as specified by recipients.
     * If the inputs to the transaction go beyond what is needed to fund
     * these outputs (plus the transaction fee),
     * additional Dojo-managed UTXOs will be generated to collect
     * the remainder (see the `outputGeneration` parameter for more on this).
     */
  outputs: DojoCreateTxOutputApi[]
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
  outputGeneration?: DojoOutputGenerationApi
  /**
     * When the fee model is "sat/kb", this is the number of satoshis per kilobyte of block space
     * that the transaction will pay.
     */
  fee?: DojoFeeModelApi
  /**
     * The labels to affix to this transaction
     */
  labels: string[]
  /**
     * A numan-readable note describing the transaction
     */
  note?: string
  /**
     * The Paymail handle for the recipient of the transaction
     */
  recipient?: string
}

export type NinjaTransactionFailedHandler = (args: NinjaTransactionFailedApi) => Promise<void>
export type NinjaTransactionProcessedHandler = (args: NinjaTransactionProcessedApi) => Promise<void>
/**
 * @returns true if tx has been handled, false to proceed and update status to 'failed'
 */
export type NinjaOutgoingTransactionHandler = (tx: DojoPendingTxApi) => Promise<boolean>

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
  index: number
  /**
     * Hex scriptcode that unlocks the satoshis.
     *
     * Note that you should create any signatures with `SIGHASH_NONE | ANYONECANPAY` or similar
     * so that the additional Dojo outputs can be added afterward without invalidating your signature.
     */
  unlockingScript: string
  spendingDescription?: string
   /**
     * Sequence number to use when spending
     */
  sequenceNumber?: number
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
     * The current state of the transaction. Common statuses are `completed` and `unproven`.
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
  labels: string[],
  inputs?: NinjaGetTransactionsTxInputApi[],
  outputs?: NinjaGetTransactionsTxOutputApi[],
}

/**
 *
 */
export interface NinjaGetTransactionsTxInputApi {
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
   spendable: boolean,
   /**
    * Spending description for this transaction input
    */
   spendingDescription?: string
}

/**
 *
 */
export interface NinjaGetTransactionsTxOutputApi {
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
   spendable: boolean,
   /**
    * Output description
    */
   description?: string
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
export interface NinjaTransactionWithOutputsResultApi {
  /**
     * The serialized, signed transaction that is ready for broadcast, or has been broadcast.
     */
  rawTx: string
  /**
     * rawTx hash as hex string
     */
  txid: string
  /**
     * The amount of the transaction
     */
  amount: number
  /**
     * This is the fully-formed `inputs` field of this transaction, as per the SPV Envelope specification.
     */
  inputs: Record<string, EnvelopeEvidenceApi>
  /**
   * 
   */
  note?: string
  /**
     * The reference number that should now be provided back to `processTransaction (or `updateTransactionStatus`)
     */
  referenceNumber: string
  /**
     * Map of change output derivationSuffix values to transaction vout indices
     */
  outputMap: Record<string, number>
  /**
     * If processed, array of acceptance responses from mapi transaction processors.
     */
  mapiResponses?: MapiResponseApi[]

  /**
   * Optional transaction processing history
   */
  log?: string
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
     * e.g. unprocessed, unsigned
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
export interface NinjaGetTransactionOutputsResultApi extends GetTransactionOutputResult {
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
   spendable: boolean,
   /**
    * When requested and available, output validity support envelope.
    */
   envelope?: EnvelopeApi,
   /**
    * When envelope requested, any custom instructions associated with this output.
    */
   customInstructions?: string
   /**
    * If `includeBasket` option is true, name of basket to which this output belongs.
    */
   basket?: string
   /**
    * If `includeTags` option is true, tags assigned to this output.
    */
   tags?: string[]
}

export interface NinjaSubmitDirectTransactionOutputApi extends SubmitDirectTransactionOutput {
  vout: number
  satoshis: number
  basket?: string
  derivationPrefix?: string
  derivationSuffix?: string
  customInstructions?: string
  senderIdentityKey?: string
  tags?: string[]
}

/**
 * Transaction input parameter to submitDirectTransaction method.
 */
export interface NinjaSubmitDirectTransactionApi extends SubmitDirectTransaction {
  rawTx: string
  txid?: string
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
  protocol?: string
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
  transaction: NinjaSubmitDirectTransactionApi
  /**
     * Provide the identity key for the person who sent the transaction
     */
  senderIdentityKey: string
  /**
     * Human-readable description for the transaction
     */
  note: string
  /**
     * Labels to assign to transaction.
     */
  labels?: string[]
  /**
     * A derivation prefix used for all outputs. If provided, derivation prefixes on all outputs are optional.
     */
  derivationPrefix?: string
  amount?: number
}

export interface NinjaSubmitDirectTransactionResultApi extends SubmitDirectTransactionResult {
  transactionId: number
  referenceNumber: string
}

export interface NinjaSignCreatedTransactionParams {
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
  inputs: Record<string, NinjaTxInputsApi>
  /**
     * A note about the transaction
     */
   note?: string
   /**
     * A lock time for the transaction
     */
   lockTime?: number
   
   createResult: DojoCreateTransactionResultApi
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
     * A lock time for the transaction
     */
   lockTime?: number
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
     * Optional. The number of satoshis to pay per KB of block space used by this transaction.
     * 
     * If both feeModel and feePerKb are specified, feeModel takes precendence
     */
  feePerKb?: number

  /**
     * Optional. The fee model used by this transaction.
     * 
     * If both feeModel and feePerKb are specified, feeModel takes precendence
     */
  feeModel?: DojoFeeModelApi

   /**
    * Set to true for normal, high performance operation and offline
    * operation if running locally.
    *
    * Always validates `submittedTransaction` and remaining inputs.
    *
    * If true, creates a self-signed MapiResponse for the transaction
    * and queues it for repeated broadcast attempts and proof validation.
    * The `status` of the transaction will be set to `unproven`.
    * 
    * If not true, attempts one broadcast and fails the transaction
    * if it is not accepted by at least one external transaction processor.
    * If it is accepted, status is set to `unproven'.
    * The transaction may still fail at a later time if a merkle
    * proof is not confirmed.
    *
    * The transaction status will be set to `completed` or `failed`
    * depending on the success or failure of broadcast attempts
    * and Chaintracks validation of a merkle proof.
    * 
    * When status is set to `unproven` or `completed`:
    * - Inputs are confirmed to be spendable false, spentBy this transaction.
    * - Outputs are set to spendable true unless already spent (spentBy is non-null).
    *
    * If the transaction fails, status is set to `failed`:
    * - Inputs are returned to spendable true, spentBy null
    * - Outputs are set to spendable false
    * - If spentBy is non-null, failure propagates to that transaction.
    */
   acceptDelayedBroadcast?: boolean

   /**
    * Optional transaction processing log
    */
   log?: string
}