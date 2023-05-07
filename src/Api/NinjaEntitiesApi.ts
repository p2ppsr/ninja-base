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
