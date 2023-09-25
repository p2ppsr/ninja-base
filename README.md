# ninja-base

Base level functions, classes, interfaces for Ninja

## API

<!--#region ts2md-api-merged-here-->
Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

### Interfaces

| | | |
| --- | --- | --- |
| [DojoExpressClientOptions](#interface-dojoexpressclientoptions) | [NinjaGetTransactionOutputsResultApi](#interface-ninjagettransactionoutputsresultapi) | [NinjaTransactionFailedApi](#interface-ninjatransactionfailedapi) |
| [DojoTxBuilderBaseOptions](#interface-dojotxbuilderbaseoptions) | [NinjaGetTransactionWithOutputsParams](#interface-ninjagettransactionwithoutputsparams) | [NinjaTransactionProcessedApi](#interface-ninjatransactionprocessedapi) |
| [DojoTxBuilderInputApi](#interface-dojotxbuilderinputapi) | [NinjaGetTransactionsResultApi](#interface-ninjagettransactionsresultapi) | [NinjaTxBuilderOptions](#interface-ninjatxbuilderoptions) |
| [DojoTxBuilderOptions](#interface-dojotxbuilderoptions) | [NinjaGetTransactionsTxApi](#interface-ninjagettransactionstxapi) | [NinjaTxInputsApi](#interface-ninjatxinputsapi) |
| [DojoTxBuilderOutputApi](#interface-dojotxbuilderoutputapi) | [NinjaGetTxWithOutputsProcessedResultApi](#interface-ninjagettxwithoutputsprocessedresultapi) | [NinjaV1Params](#interface-ninjav1params) |
| [KeyPairApi](#interface-keypairapi) | [NinjaGetTxWithOutputsResultApi](#interface-ninjagettxwithoutputsresultapi) | [ProcessIncomingTransactionApi](#interface-processincomingtransactionapi) |
| [NinjaApi](#interface-ninjaapi) | [NinjaOutputToRedeemApi](#interface-ninjaoutputtoredeemapi) | [ProcessIncomingTransactionInputApi](#interface-processincomingtransactioninputapi) |
| [NinjaCreateTransactionParams](#interface-ninjacreatetransactionparams) | [NinjaSubmitDirectTransactionApi](#interface-ninjasubmitdirecttransactionapi) | [ProcessIncomingTransactionOutputApi](#interface-processincomingtransactionoutputapi) |
| [NinjaGetPendingTransactionsInputApi](#interface-ninjagetpendingtransactionsinputapi) | [NinjaSubmitDirectTransactionOutputApi](#interface-ninjasubmitdirecttransactionoutputapi) | [ProcessIncomingTransactionResultApi](#interface-processincomingtransactionresultapi) |
| [NinjaGetPendingTransactionsInstructionsApi](#interface-ninjagetpendingtransactionsinstructionsapi) | [NinjaSubmitDirectTransactionParams](#interface-ninjasubmitdirecttransactionparams) | [TxOutputApi](#interface-txoutputapi) |
| [NinjaGetPendingTransactionsTxApi](#interface-ninjagetpendingtransactionstxapi) | [NinjaSubmitDirectTransactionResultApi](#interface-ninjasubmitdirecttransactionresultapi) | [TxRedeemableOutputApi](#interface-txredeemableoutputapi) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---

#### Interface: NinjaApi

##### Description

A client for creating, signing, and delivering Bitcoin transactions

```ts
export interface NinjaApi {
    dojo: DojoClientApi;
    authenticate(identityKey?: string, addIfNew?: boolean): Promise<void>;
    sync(): Promise<void>;
    setSyncDojosByConfig(syncDojoConfigs: SyncDojoConfigBaseApi[], options?: DojoSyncOptionsApi): Promise<void>;
    getSyncDojosByConfig(): Promise<{
        dojos: SyncDojoConfigBaseApi[];
        options?: DojoSyncOptionsApi;
    }>;
    getClientChangeKeyPair(): KeyPairApi;
    getPaymail(): Promise<string>;
    setPaymail(paymail: string): Promise<void>;
    getChain(): Promise<Chain>;
    getNetwork(format?: "default" | "nonet"): Promise<string>;
    findCertificates(certifiers?: string[] | object, types?: Record<string, string[]>): Promise<{
        status: "success";
        certificates: DojoCertificateApi[];
    }>;
    saveCertificate(certificate: DojoCertificateApi | object): Promise<void>;
    getTotalValue(basket?: string): Promise<{
        total: number;
    }>;
    getTotalOfAmounts(options: DojoGetTotalOfAmountsOptions): Promise<{
        total: number;
    }>;
    getNetOfAmounts(options?: DojoGetTotalOfAmountsOptions): Promise<number>;
    getAvatar(): Promise<DojoAvatarApi>;
    setAvatar(name: string, photoURL: string): Promise<void>;
    getTransactions(options?: DojoGetTransactionsOptions): Promise<NinjaGetTransactionsResultApi>;
    getTransactionOutputs(options?: DojoGetTransactionOutputsOptions): Promise<NinjaGetTransactionOutputsResultApi[]>;
    getPendingTransactions(referenceNumber?: string): Promise<DojoPendingTxApi[]>;
    updateTransactionStatus(params: {
        reference: string;
        status: DojoTransactionStatusApi;
    }): Promise<void>;
    updateOutpointStatus(params: {
        txid: string;
        vout: number;
        spendable: boolean;
    }): Promise<void>;
    processPendingTransactions(onTransactionProcessed?: NinjaTransactionProcessedHandler, onTransactionFailed?: NinjaTransactionFailedHandler): Promise<void>;
    processTransaction(params: {
        submittedTransaction: string | Buffer;
        reference: string;
        outputMap: Record<string, number>;
    }): Promise<DojoProcessTransactionResultApi>;
    getTransactionWithOutputs(params: NinjaGetTransactionWithOutputsParams): Promise<NinjaGetTxWithOutputsResultApi | NinjaGetTxWithOutputsProcessedResultApi>;
    createTransaction(params: NinjaCreateTransactionParams): Promise<DojoCreateTransactionResultApi>;
    submitDirectTransaction(params: NinjaSubmitDirectTransactionParams): Promise<NinjaSubmitDirectTransactionResultApi>;
}
```

<details>

<summary>Interface NinjaApi Details</summary>

##### Interface NinjaApi Property dojo

The dojo user wallet database supporting this api.

isAuthenticated must be true.

```ts
dojo: DojoClientApi
```

##### Interface NinjaApi Method authenticate

Authenticates with configured dojo, if necessary.

```ts
authenticate(identityKey?: string, addIfNew?: boolean): Promise<void>
```

<details>

<summary>Interface NinjaApi Method authenticate Details</summary>

###### identityKey

Optional. The user's public identity key. Must be authorized to act on behalf of this user.

###### addIfNew

Optional. Create new user records if identityKey is unknown.

</details>

##### Interface NinjaApi Method createTransaction

Creates a new transaction that must be processed with `processTransaction`
after you sign it

```ts
createTransaction(params: NinjaCreateTransactionParams): Promise<DojoCreateTransactionResultApi>
```

<details>

<summary>Interface NinjaApi Method createTransaction Details</summary>

###### Returns

The template you need to sign and process

</details>

##### Interface NinjaApi Method findCertificates

Use this endpoint to retrieve certificates.

```ts
findCertificates(certifiers?: string[] | object, types?: Record<string, string[]>): Promise<{
    status: "success";
    certificates: DojoCertificateApi[];
}>
```

<details>

<summary>Interface NinjaApi Method findCertificates Details</summary>

###### Returns

A success object with `status: "success"` and any found certificates

###### obj

All parameters are given in an object

</details>

##### Interface NinjaApi Method getAvatar

Returns the name and photo URL of the user

```ts
getAvatar(): Promise<DojoAvatarApi>
```

<details>

<summary>Interface NinjaApi Method getAvatar Details</summary>

###### Returns

The avatar of the user

</details>

##### Interface NinjaApi Method getChain

Returns which BSV network we are using (main or test)

```ts
getChain(): Promise<Chain>
```

##### Interface NinjaApi Method getClientChangeKeyPair

Return the private / public keypair used by the Ninja client for change UTXOs

```ts
getClientChangeKeyPair(): KeyPairApi
```

##### Interface NinjaApi Method getNetOfAmounts

Returns the net sum of transaction amounts belonging to authenticated user,
incoming minus outgoing,
and optionally matching conditions in `options`.

```ts
getNetOfAmounts(options?: DojoGetTotalOfAmountsOptions): Promise<number>
```

##### Interface NinjaApi Method getNetwork

Returns which BSV network we are using (mainnet or testnet)

```ts
getNetwork(format?: "default" | "nonet"): Promise<string>
```

<details>

<summary>Interface NinjaApi Method getNetwork Details</summary>

###### Returns

The current BSV network formatted as requested.

###### format

for the returned string. Either with (default) or without (nonet) a 'net' suffix.

</details>

##### Interface NinjaApi Method getPaymail

Returns the current Paymail handle

```ts
getPaymail(): Promise<string>
```

##### Interface NinjaApi Method getPendingTransactions

Returns a set of all transactions that need to be signed and submitted, or canceled

```ts
getPendingTransactions(referenceNumber?: string): Promise<DojoPendingTxApi[]>
```

##### Interface NinjaApi Method getSyncDojosByConfig

Gets the currently configured syncDojos and sync options.

If syncDojos are not being managed by `setSyncDojosByConfig` the returned configurations may include
a 'dojoType' of '<custom>'.

```ts
getSyncDojosByConfig(): Promise<{
    dojos: SyncDojoConfigBaseApi[];
    options?: DojoSyncOptionsApi;
}>
```

##### Interface NinjaApi Method getTotalOfAmounts

Returns the sum of transaction amounts belonging to authenticated user,
matching the given direction (which must be specified),
and optionally matching remaining conditions in `options`.

```ts
getTotalOfAmounts(options: DojoGetTotalOfAmountsOptions): Promise<{
    total: number;
}>
```

##### Interface NinjaApi Method getTotalValue

Returns the total of unspent outputs in satoshis. A non-negative integer.

```ts
getTotalValue(basket?: string): Promise<{
    total: number;
}>
```

<details>

<summary>Interface NinjaApi Method getTotalValue Details</summary>

###### basket

defaults to 'default' if undefined

</details>

##### Interface NinjaApi Method getTransactionOutputs

Returns a set of transaction outputs that Dojo has tracked

```ts
getTransactionOutputs(options?: DojoGetTransactionOutputsOptions): Promise<NinjaGetTransactionOutputsResultApi[]>
```

##### Interface NinjaApi Method getTransactionWithOutputs

Creates and signs a transaction with specified outputs, so that it can be processed with `processTransaction`. This is a higher-level wrapper around `createTransaction` so that you do not need to manually handle signing, when you are not providing any non-Dojo inputs.

Use this by default, and fall back to `createTransaction` if you need more customization.

```ts
getTransactionWithOutputs(params: NinjaGetTransactionWithOutputsParams): Promise<NinjaGetTxWithOutputsResultApi | NinjaGetTxWithOutputsProcessedResultApi>
```

<details>

<summary>Interface NinjaApi Method getTransactionWithOutputs Details</summary>

###### Returns

`GetTxWithOutputsResult` if not autoProcess

`GetTxWithOutputsProcessedResult` if autoProcess

</details>

##### Interface NinjaApi Method getTransactions

Returns a set of transactions that match the criteria

```ts
getTransactions(options?: DojoGetTransactionsOptions): Promise<NinjaGetTransactionsResultApi>
```

<details>

<summary>Interface NinjaApi Method getTransactions Details</summary>

###### options

limit defaults to 25, offset defaults to 0, addLabels defaults to true, order defaults to 'descending'

</details>

##### Interface NinjaApi Method processPendingTransactions

Signs and processes all pending transactions, useful when recovering from an
error or crash, or on startup. If a transaction fails to process, marks it
as failed.

```ts
processPendingTransactions(onTransactionProcessed?: NinjaTransactionProcessedHandler, onTransactionFailed?: NinjaTransactionFailedHandler): Promise<void>
```

##### Interface NinjaApi Method processTransaction

After a transaction is created (with `createTransaction` or with `getTransactionWithOutputs`),
submit the serialized raw transaction to transaction processors for processing.

```ts
processTransaction(params: {
    submittedTransaction: string | Buffer;
    reference: string;
    outputMap: Record<string, number>;
}): Promise<DojoProcessTransactionResultApi>
```

<details>

<summary>Interface NinjaApi Method processTransaction Details</summary>

###### Returns

`DojoProcessTransactionResultApi` with txid and status of 'completed' or 'unknown'

###### params.submittedTransaction

The transaction that has been created and signed

###### params.reference

The reference number provided by `createTransaction` or `getTransactionWithOutputs`

###### params.outputMap

An object whose keys are derivation prefixes
and whose values are corresponding change output numbers from the transaction.

</details>

##### Interface NinjaApi Method saveCertificate

Use this endpoint to store an incoming certificate.

```ts
saveCertificate(certificate: DojoCertificateApi | object): Promise<void>
```

<details>

<summary>Interface NinjaApi Method saveCertificate Details</summary>

###### Returns

A success object with `status: "success"`

###### obj

All parameters are given in an object

</details>

##### Interface NinjaApi Method setAvatar

Sets a new name and photo URL

```ts
setAvatar(name: string, photoURL: string): Promise<void>
```

<details>

<summary>Interface NinjaApi Method setAvatar Details</summary>

###### name

A new name

###### photoURL

A new UHRP or HTTPS URL to a photo of the user

</details>

##### Interface NinjaApi Method setPaymail

Changes the Paymail handle of the user.

NOTE that the old handle will be available for others to use.

NOTE that to prevent span, you may only do this if there is at least one unspent output under Dojo management.

```ts
setPaymail(paymail: string): Promise<void>
```

##### Interface NinjaApi Method setSyncDojosByConfig

Sets the syncDojo's to be used by all users by the `sync()` function.

Each syncDojo config has the following properties:

'dojoType' one of 'Cloud URL' | 'Sqlite File' | 'MySql Connection'
'dojoIdentityKey' the identity key of the syncDojo.
'dojoName' the name of the syncDojo.

Currently supports three syncDojo configurations, each identified by its dojoType:

'Sqlite File'
  The derived `SyncDojoConfigSqliteFile` interface adds:
  'filename' will be passed to Knex Sqlite3 to configure a locally accessible, single user Sqlite database.
  If the database exists, it must already be configured with matching dojoIdentityKey.
  If the database does not exist and can be created, it will be configured with the specified dojoIdentityKey.

'MySql Connection'
  The derived `SyncDojoConfigMySqlConnection` interface adds:
  'connection', a stringified MySql connection object, will be passed to Knex MySql to access a network
  accessible, possibly shared, MySql database.
  The database must exists and must already be configured with matching dojoIdentityKey.

'Cloud URL'
  The derived `SyncDojoConfigCloudUrl` interface adds:
  'url' the service URL of the cloud dojo with which to sync
  'clientPrivateKey' should be set to the string value 'true' to enable automatic use of Authrite as the authenticated user.
  'useIdentityKey' may be set to true instead of using 'clientPrivateKey' if the cloud dojo does not use Authrite for access control.
  The cloud dojo must exists and must already be configured with matching dojoIdentityKey.

```ts
setSyncDojosByConfig(syncDojoConfigs: SyncDojoConfigBaseApi[], options?: DojoSyncOptionsApi): Promise<void>
```

<details>

<summary>Interface NinjaApi Method setSyncDojosByConfig Details</summary>

###### syncDojoConfigs

array of syncDojos to be used. May be empty.

###### options

place holder for future synchronization control options.

</details>

##### Interface NinjaApi Method submitDirectTransaction

This endpoint allows a recipient to submit a transactions that was directly given to them by a sender.
Saves the inputs and key derivation information, allowing the UTXOs to be redeemed in the future.
Sets the transaction to completed and marks the outputs as spendable.

```ts
submitDirectTransaction(params: NinjaSubmitDirectTransactionParams): Promise<NinjaSubmitDirectTransactionResultApi>
```

##### Interface NinjaApi Method sync

Sync's the dojo's state for the authenticated user with all of the configured syncDojos

This method should only be called when either a local or remote state change occurs, or may have occurred.

User state changes are propagated across all configured syncDojos.

```ts
sync(): Promise<void>
```

##### Interface NinjaApi Method updateOutpointStatus

Use this endpoint to update the status of one of your outputs, given as the TXID of a transaction and the vout (output index) in that transaction. This is useful for flagging transaction outpoints as spent if they were inadvertantly broadcasted or used without properly submitting them to the Dojo, or to undo the spending of an output if it was never actually spent.

```ts
updateOutpointStatus(params: {
    txid: string;
    vout: number;
    spendable: boolean;
}): Promise<void>
```

<details>

<summary>Interface NinjaApi Method updateOutpointStatus Details</summary>

###### params.txid

The TXID of the transaction that created the output

###### params.vout

The index of the output in the transaction

###### params.spendable

The true spendability status of this outpoint

</details>

##### Interface NinjaApi Method updateTransactionStatus

Use this endpoint to update the status of a transaction. This is useful for flagging incomplete transactions as aborted or reverting a completed transaction back into a pending status if it never got confirmed. Setting the status to "completed" or "waitingForSenderToSend" will make any selected UTXOs unavailable for spending, while any other status value will free up the UTXOs for use in other transactions.

```ts
updateTransactionStatus(params: {
    reference: string;
    status: DojoTransactionStatusApi;
}): Promise<void>
```

<details>

<summary>Interface NinjaApi Method updateTransactionStatus Details</summary>

###### params.reference

The Dojo reference number for the transaction

###### params.status

The new status of the transaction

</details>

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: NinjaCreateTransactionParams

##### Description

Input parameters to createTransaction method.

```ts
export interface NinjaCreateTransactionParams {
    inputs: Record<string, DojoTxInputsApi>;
    inputSelection: DojoTxInputSelectionApi;
    outputs: DojoCreateTxOutputApi[];
    outputGeneration: DojoOutputGenerationApi;
    fee: DojoFeeModelApi;
    labels: string[];
    note?: string;
    recipient?: string;
}
```

<details>

<summary>Interface NinjaCreateTransactionParams Details</summary>

##### Interface NinjaCreateTransactionParams Property fee

When the fee model is "sat/kb", this is the number of satoshis per kilobyte of block space
that the transaction will pay.

```ts
fee: DojoFeeModelApi
```

##### Interface NinjaCreateTransactionParams Property inputSelection

If Dojo needs to select more inputs beyond what you provided in the `inputs` parameter,
this parameter describes which kinds of inputs can be selected, and from where.

```ts
inputSelection: DojoTxInputSelectionApi
```

##### Interface NinjaCreateTransactionParams Property inputs

Specify any additional inputs to the transaction (if any) that are not to be provided by the Dojo.
If you do not provide inputs here, or if they are insufficient,
Dojo will select additional inputs for you to sign.
To control this input selection behavior, see the `inputSelection` parameter.
This `inputs` parameter is an object whose keys are TXIDs of input transactions,
and whose values are their associated SPV envelopes.

```ts
inputs: Record<string, DojoTxInputsApi>
```

##### Interface NinjaCreateTransactionParams Property labels

The labels to affix to this transaction

```ts
labels: string[]
```

##### Interface NinjaCreateTransactionParams Property note

A numan-readable note describing the transaction

```ts
note?: string
```

##### Interface NinjaCreateTransactionParams Property outputGeneration

If Dojo needs to generate additional outputs for the transaction beyond what was specified,
this object describes what kind of outputs to generate, and where they should be kept.

The method used to generate outputs.
"auto" selects the amount and types of generated outputs based on the selected basket's
configuration for how many of each type to keep on hand,
then uses Benford's law to distribute the satoshis across them.
"single" just uses one output, randomly selected from the available types,
that contains all the satoshis.

```ts
outputGeneration: DojoOutputGenerationApi
```

##### Interface NinjaCreateTransactionParams Property outputs

External outputs that you will include when you create this transaction.
These outputs can contain custom scripts as specified by recipients.
If the inputs to the transaction go beyond what is needed to fund
these outputs (plus the transaction fee),
additional Dojo-managed UTXOs will be generated to collect
the remainder (see the `outputGeneration` parameter for more on this).

```ts
outputs: DojoCreateTxOutputApi[]
```

##### Interface NinjaCreateTransactionParams Property recipient

The Paymail handle for the recipient of the transaction

```ts
recipient?: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: NinjaTransactionFailedApi

```ts
export interface NinjaTransactionFailedApi {
    inputs: Record<string, DojoPendingTxInputApi>;
    isOutgoing: boolean;
    reference: string;
    error: CwiError;
}
```

<details>

<summary>Interface NinjaTransactionFailedApi Details</summary>

##### Interface NinjaTransactionFailedApi Property error

```ts
error: CwiError
```

##### Interface NinjaTransactionFailedApi Property inputs

```ts
inputs: Record<string, DojoPendingTxInputApi>
```

##### Interface NinjaTransactionFailedApi Property isOutgoing

```ts
isOutgoing: boolean
```

##### Interface NinjaTransactionFailedApi Property reference

```ts
reference: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: NinjaTransactionProcessedApi

```ts
export interface NinjaTransactionProcessedApi {
    inputs: Record<string, DojoPendingTxInputApi>;
    outputs: DojoPendingTxOutputApi[];
    isOutgoing: boolean;
    reference: string;
    txid: string;
    amount: number;
    hex: string;
    derivationPrefix?: string;
    senderIdentityKey?: string;
}
```

<details>

<summary>Interface NinjaTransactionProcessedApi Details</summary>

##### Interface NinjaTransactionProcessedApi Property amount

```ts
amount: number
```

##### Interface NinjaTransactionProcessedApi Property derivationPrefix

```ts
derivationPrefix?: string
```

##### Interface NinjaTransactionProcessedApi Property hex

```ts
hex: string
```

##### Interface NinjaTransactionProcessedApi Property inputs

```ts
inputs: Record<string, DojoPendingTxInputApi>
```

##### Interface NinjaTransactionProcessedApi Property isOutgoing

```ts
isOutgoing: boolean
```

##### Interface NinjaTransactionProcessedApi Property outputs

```ts
outputs: DojoPendingTxOutputApi[]
```

##### Interface NinjaTransactionProcessedApi Property reference

```ts
reference: string
```

##### Interface NinjaTransactionProcessedApi Property senderIdentityKey

```ts
senderIdentityKey?: string
```

##### Interface NinjaTransactionProcessedApi Property txid

```ts
txid: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: NinjaOutputToRedeemApi

```ts
export interface NinjaOutputToRedeemApi {
    index: number;
    unlockingScript: string;
    spendingDescription?: string;
    sequenceNumber?: number;
}
```

<details>

<summary>Interface NinjaOutputToRedeemApi Details</summary>

##### Interface NinjaOutputToRedeemApi Property index

```ts
index: number
```

##### Interface NinjaOutputToRedeemApi Property sequenceNumber

```ts
sequenceNumber?: number
```

##### Interface NinjaOutputToRedeemApi Property spendingDescription

```ts
spendingDescription?: string
```

##### Interface NinjaOutputToRedeemApi Property unlockingScript

```ts
unlockingScript: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: NinjaTxInputsApi

```ts
export interface NinjaTxInputsApi extends EnvelopeEvidenceApi {
    outputsToRedeem: NinjaOutputToRedeemApi[];
}
```

<details>

<summary>Interface NinjaTxInputsApi Details</summary>

##### Interface NinjaTxInputsApi Property outputsToRedeem

```ts
outputsToRedeem: NinjaOutputToRedeemApi[]
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: KeyPairApi

```ts
export interface KeyPairApi {
    privateKey: string;
    publicKey: string;
}
```

<details>

<summary>Interface KeyPairApi Details</summary>

##### Interface KeyPairApi Property privateKey

```ts
privateKey: string
```

##### Interface KeyPairApi Property publicKey

```ts
publicKey: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: NinjaGetTransactionsTxApi

```ts
export interface NinjaGetTransactionsTxApi {
    txid: string;
    amount: number;
    status: string;
    senderPaymail: string;
    recipientPaymail: string;
    isOutgoing: boolean;
    note: string;
    created_at: string;
    referenceNumber: string;
    labels: string[];
}
```

<details>

<summary>Interface NinjaGetTransactionsTxApi Details</summary>

##### Interface NinjaGetTransactionsTxApi Property amount

```ts
amount: number
```

##### Interface NinjaGetTransactionsTxApi Property created_at

```ts
created_at: string
```

##### Interface NinjaGetTransactionsTxApi Property isOutgoing

```ts
isOutgoing: boolean
```

##### Interface NinjaGetTransactionsTxApi Property labels

```ts
labels: string[]
```

##### Interface NinjaGetTransactionsTxApi Property note

```ts
note: string
```

##### Interface NinjaGetTransactionsTxApi Property recipientPaymail

```ts
recipientPaymail: string
```

##### Interface NinjaGetTransactionsTxApi Property referenceNumber

```ts
referenceNumber: string
```

##### Interface NinjaGetTransactionsTxApi Property senderPaymail

```ts
senderPaymail: string
```

##### Interface NinjaGetTransactionsTxApi Property status

```ts
status: string
```

##### Interface NinjaGetTransactionsTxApi Property txid

```ts
txid: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: NinjaGetTransactionsResultApi

##### Description

```ts
export interface NinjaGetTransactionsResultApi {
    totalTransactions: number;
    transactions: NinjaGetTransactionsTxApi[];
}
```

<details>

<summary>Interface NinjaGetTransactionsResultApi Details</summary>

##### Interface NinjaGetTransactionsResultApi Property totalTransactions

The number of transactions in the complete set

```ts
totalTransactions: number
```

##### Interface NinjaGetTransactionsResultApi Property transactions

The specific transactions from the set that were requested, based on `limit` and `offset`

```ts
transactions: NinjaGetTransactionsTxApi[]
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: NinjaGetTxWithOutputsResultApi

##### Description

```ts
export interface NinjaGetTxWithOutputsResultApi {
    rawTx: string;
    txid: string;
    referenceNumber: string;
    amount: number;
    inputs: Record<string, EnvelopeEvidenceApi>;
    outputMap: Record<string, number>;
}
```

<details>

<summary>Interface NinjaGetTxWithOutputsResultApi Details</summary>

##### Interface NinjaGetTxWithOutputsResultApi Property amount

The amount of the transaction

```ts
amount: number
```

##### Interface NinjaGetTxWithOutputsResultApi Property inputs

This is the fully-formed `inputs` field of this transaction, as per the SPV Envelope specification.

```ts
inputs: Record<string, EnvelopeEvidenceApi>
```

##### Interface NinjaGetTxWithOutputsResultApi Property outputMap

Map of change output derivationSuffix values to transaction vout indices

```ts
outputMap: Record<string, number>
```

##### Interface NinjaGetTxWithOutputsResultApi Property rawTx

The serialized, signed transaction that is ready for broadcast

```ts
rawTx: string
```

##### Interface NinjaGetTxWithOutputsResultApi Property referenceNumber

The reference number that should now be provided back to `processTransaction (or `updateTransactionStatus`)

```ts
referenceNumber: string
```

##### Interface NinjaGetTxWithOutputsResultApi Property txid

rawTx hash as hex string

```ts
txid: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: NinjaGetTxWithOutputsProcessedResultApi

##### Description

```ts
export interface NinjaGetTxWithOutputsProcessedResultApi {
    rawTx: string;
    txid: string;
    mapiResponses: MapiResponseApi[];
    note?: string;
    amount: number;
    inputs: object;
}
```

<details>

<summary>Interface NinjaGetTxWithOutputsProcessedResultApi Details</summary>

##### Interface NinjaGetTxWithOutputsProcessedResultApi Property amount

The amount of the transaction

```ts
amount: number
```

##### Interface NinjaGetTxWithOutputsProcessedResultApi Property inputs

This is the fully-formed `inputs` field of this transaction, as per the SPV Envelope specification.

```ts
inputs: object
```

##### Interface NinjaGetTxWithOutputsProcessedResultApi Property mapiResponses

On 'completed' status, array of acceptance responses from mapi transaction processors.

```ts
mapiResponses: MapiResponseApi[]
```

##### Interface NinjaGetTxWithOutputsProcessedResultApi Property note

...

```ts
note?: string
```

##### Interface NinjaGetTxWithOutputsProcessedResultApi Property rawTx

The serialized, signed transaction that is ready for broadcast

```ts
rawTx: string
```

##### Interface NinjaGetTxWithOutputsProcessedResultApi Property txid

rawTx hash as hex string

```ts
txid: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: NinjaGetPendingTransactionsInstructionsApi

```ts
export interface NinjaGetPendingTransactionsInstructionsApi {
    type: string;
    derivationPrefix: string | null;
    derivationSuffix: string | null;
    paymailHandle: string | null;
    senderIdentityKey: string | null;
    customInstructions: string | null;
}
```

<details>

<summary>Interface NinjaGetPendingTransactionsInstructionsApi Details</summary>

##### Interface NinjaGetPendingTransactionsInstructionsApi Property customInstructions

```ts
customInstructions: string | null
```

##### Interface NinjaGetPendingTransactionsInstructionsApi Property derivationPrefix

```ts
derivationPrefix: string | null
```

##### Interface NinjaGetPendingTransactionsInstructionsApi Property derivationSuffix

```ts
derivationSuffix: string | null
```

##### Interface NinjaGetPendingTransactionsInstructionsApi Property paymailHandle

```ts
paymailHandle: string | null
```

##### Interface NinjaGetPendingTransactionsInstructionsApi Property senderIdentityKey

```ts
senderIdentityKey: string | null
```

##### Interface NinjaGetPendingTransactionsInstructionsApi Property type

```ts
type: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: NinjaGetPendingTransactionsInputApi

```ts
export interface NinjaGetPendingTransactionsInputApi extends EnvelopeEvidenceApi {
    outputsToRedeem: number[];
    instructions: Record<number, NinjaGetPendingTransactionsInstructionsApi>;
}
```

<details>

<summary>Interface NinjaGetPendingTransactionsInputApi Details</summary>

##### Interface NinjaGetPendingTransactionsInputApi Property instructions

```ts
instructions: Record<number, NinjaGetPendingTransactionsInstructionsApi>
```

##### Interface NinjaGetPendingTransactionsInputApi Property outputsToRedeem

```ts
outputsToRedeem: number[]
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: NinjaGetPendingTransactionsTxApi

##### Description

```ts
export interface NinjaGetPendingTransactionsTxApi {
    transactionId: number;
    created_at: string;
    provenTxId?: number | null;
    status: DojoTransactionStatusApi;
    isOutgoing: boolean;
    amount: number;
    senderPaymail: string | undefined | null;
    referenceNumber: string;
    truncatedExternalInputs: string | null;
    rawTransaction: Buffer | null;
    inputs?: Record<string, NinjaGetPendingTransactionsInputApi>;
}
```

<details>

<summary>Interface NinjaGetPendingTransactionsTxApi Details</summary>

##### Interface NinjaGetPendingTransactionsTxApi Property amount

The number of satoshis added or removed from Dojo by this transaction

```ts
amount: number
```

##### Interface NinjaGetPendingTransactionsTxApi Property created_at

The time the transaction was registered with the Dojo

```ts
created_at: string
```

##### Interface NinjaGetPendingTransactionsTxApi Property inputs

parsed truncatedExternalInputs

```ts
inputs?: Record<string, NinjaGetPendingTransactionsInputApi>
```

##### Interface NinjaGetPendingTransactionsTxApi Property isOutgoing

```ts
isOutgoing: boolean
```

##### Interface NinjaGetPendingTransactionsTxApi Property provenTxId

Is valid when transaction proof record exists in DojoProvenTxApi table.

```ts
provenTxId?: number | null
```

##### Interface NinjaGetPendingTransactionsTxApi Property rawTransaction

```ts
rawTransaction: Buffer | null
```

##### Interface NinjaGetPendingTransactionsTxApi Property referenceNumber

The Dojo reference number for the transaction

```ts
referenceNumber: string
```

##### Interface NinjaGetPendingTransactionsTxApi Property senderPaymail

The Paymail handle of the person who sent the transaction

```ts
senderPaymail: string | undefined | null
```

##### Interface NinjaGetPendingTransactionsTxApi Property status

max length of 64
e.g. completed, failed, unprocessed, waitingForSenderToSend

```ts
status: DojoTransactionStatusApi
```

##### Interface NinjaGetPendingTransactionsTxApi Property transactionId

```ts
transactionId: number
```

##### Interface NinjaGetPendingTransactionsTxApi Property truncatedExternalInputs

```ts
truncatedExternalInputs: string | null
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: TxRedeemableOutputApi

##### Description

```ts
export interface TxRedeemableOutputApi {
    index: number;
    unlockingScriptLength: number;
}
```

<details>

<summary>Interface TxRedeemableOutputApi Details</summary>

##### Interface TxRedeemableOutputApi Property index

The index of the output to redeem in the transaction

```ts
index: number
```

##### Interface TxRedeemableOutputApi Property unlockingScriptLength

The byte length of the unlocking script you intend to use to unlock this output

```ts
unlockingScriptLength: number
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: TxOutputApi

##### Description

```ts
export interface TxOutputApi {
    satoshis: number;
    script: string;
}
```

<details>

<summary>Interface TxOutputApi Details</summary>

##### Interface TxOutputApi Property satoshis

The amount of satoshis that will be in the output

```ts
satoshis: number
```

##### Interface TxOutputApi Property script

The hex string representing the output locking script

```ts
script: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: NinjaGetTransactionOutputsResultApi

##### Description

```ts
export interface NinjaGetTransactionOutputsResultApi {
    txid: string;
    vout: number;
    amount: number;
    outputScript: string;
    type: string;
    spendable: boolean;
}
```

<details>

<summary>Interface NinjaGetTransactionOutputsResultApi Details</summary>

##### Interface NinjaGetTransactionOutputsResultApi Property amount

Number of satoshis in the output

```ts
amount: number
```

##### Interface NinjaGetTransactionOutputsResultApi Property outputScript

Hex representation of output locking script

```ts
outputScript: string
```

##### Interface NinjaGetTransactionOutputsResultApi Property spendable

Whether this output is free to be spent

```ts
spendable: boolean
```

##### Interface NinjaGetTransactionOutputsResultApi Property txid

Transaction ID of transaction that created the output

```ts
txid: string
```

##### Interface NinjaGetTransactionOutputsResultApi Property type

The type of output, for example "P2PKH" or "P2RPH"

```ts
type: string
```

##### Interface NinjaGetTransactionOutputsResultApi Property vout

Index in the transaction of the output

```ts
vout: number
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: NinjaSubmitDirectTransactionOutputApi

```ts
export interface NinjaSubmitDirectTransactionOutputApi {
    vout: number;
    basket: string;
    derivationPrefix?: string;
    derivationSuffix?: string;
    customInstructions?: object;
}
```

<details>

<summary>Interface NinjaSubmitDirectTransactionOutputApi Details</summary>

##### Interface NinjaSubmitDirectTransactionOutputApi Property basket

```ts
basket: string
```

##### Interface NinjaSubmitDirectTransactionOutputApi Property customInstructions

```ts
customInstructions?: object
```

##### Interface NinjaSubmitDirectTransactionOutputApi Property derivationPrefix

```ts
derivationPrefix?: string
```

##### Interface NinjaSubmitDirectTransactionOutputApi Property derivationSuffix

```ts
derivationSuffix?: string
```

##### Interface NinjaSubmitDirectTransactionOutputApi Property vout

```ts
vout: number
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: NinjaSubmitDirectTransactionApi

##### Description

Transaction input parameter to submitDirectTransaction method.

```ts
export interface NinjaSubmitDirectTransactionApi {
    rawTx: string;
    inputs?: Record<string, EnvelopeEvidenceApi>;
    mapiResponses?: MapiResponseApi[];
    proof?: TscMerkleProofApi;
    outputs: NinjaSubmitDirectTransactionOutputApi[];
    referenceNumber?: string;
}
```

<details>

<summary>Interface NinjaSubmitDirectTransactionApi Details</summary>

##### Interface NinjaSubmitDirectTransactionApi Property inputs

```ts
inputs?: Record<string, EnvelopeEvidenceApi>
```

##### Interface NinjaSubmitDirectTransactionApi Property mapiResponses

```ts
mapiResponses?: MapiResponseApi[]
```

##### Interface NinjaSubmitDirectTransactionApi Property outputs

sparse array of outputs of interest where indices match vout numbers.

```ts
outputs: NinjaSubmitDirectTransactionOutputApi[]
```

##### Interface NinjaSubmitDirectTransactionApi Property proof

```ts
proof?: TscMerkleProofApi
```

##### Interface NinjaSubmitDirectTransactionApi Property rawTx

```ts
rawTx: string
```

##### Interface NinjaSubmitDirectTransactionApi Property referenceNumber

```ts
referenceNumber?: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: NinjaSubmitDirectTransactionParams

##### Description

Input parameters to submitDirectTransaction method.

```ts
export interface NinjaSubmitDirectTransactionParams {
    protocol: string;
    transaction: NinjaSubmitDirectTransactionApi;
    senderIdentityKey: string;
    note: string;
    labels: string[];
    derivationPrefix?: string;
    amount?: number;
}
```

<details>

<summary>Interface NinjaSubmitDirectTransactionParams Details</summary>

##### Interface NinjaSubmitDirectTransactionParams Property amount

```ts
amount?: number
```

##### Interface NinjaSubmitDirectTransactionParams Property derivationPrefix

A derivation prefix used for all outputs. If provided, derivation prefixes on all outputs are optional.

```ts
derivationPrefix?: string
```

##### Interface NinjaSubmitDirectTransactionParams Property labels

Labels to assign to transaction.

```ts
labels: string[]
```

##### Interface NinjaSubmitDirectTransactionParams Property note

Human-readable description for the transaction

```ts
note: string
```

##### Interface NinjaSubmitDirectTransactionParams Property protocol

Specify the transaction submission payment protocol to use.
Currently, the only supported protocol is that with BRFC ID "3241645161d8"

```ts
protocol: string
```

##### Interface NinjaSubmitDirectTransactionParams Property senderIdentityKey

Provide the identity key for the person who sent the transaction

```ts
senderIdentityKey: string
```

##### Interface NinjaSubmitDirectTransactionParams Property transaction

The transaction envelope to submit, including key derivation information.

transaction.outputs is an array of outputs, each containing:
 `vout`,
 `satoshis`,
 `derivationSuffix`,
 and (optionally), `derivationPrefix`.

If a global `derivationPrefix` is used (recommended),
output-specific derivation prefixes should be omitted.

```ts
transaction: NinjaSubmitDirectTransactionApi
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: NinjaSubmitDirectTransactionResultApi

```ts
export interface NinjaSubmitDirectTransactionResultApi {
    transactionId: number;
    referenceNumber: string;
}
```

<details>

<summary>Interface NinjaSubmitDirectTransactionResultApi Details</summary>

##### Interface NinjaSubmitDirectTransactionResultApi Property referenceNumber

```ts
referenceNumber: string
```

##### Interface NinjaSubmitDirectTransactionResultApi Property transactionId

```ts
transactionId: number
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: NinjaGetTransactionWithOutputsParams

##### Description

Input parameters to getTransactionWithOutputs method.

```ts
export interface NinjaGetTransactionWithOutputsParams {
    outputs: DojoCreateTxOutputApi[];
    labels?: string[];
    inputs?: Record<string, NinjaTxInputsApi>;
    note?: string;
    lockTime?: number;
    recipient?: string;
    autoProcess?: boolean;
    feePerKb?: number;
}
```

<details>

<summary>Interface NinjaGetTransactionWithOutputsParams Details</summary>

##### Interface NinjaGetTransactionWithOutputsParams Property autoProcess

Whether the transaction should be processed automatically
with processTransaction. Note that this will return `mapiResponses` and `note`
instead of referenceNumber

default true

```ts
autoProcess?: boolean
```

##### Interface NinjaGetTransactionWithOutputsParams Property feePerKb

The number of satoshis to pay per KB of block space used by this transaction.

default 110

```ts
feePerKb?: number
```

##### Interface NinjaGetTransactionWithOutputsParams Property inputs

Input scripts to spend as part of this transaction.

This is an object whose keys are TXIDs and whose values are Everett-style
transaction envelopes that contain an additional field called `outputsToRedeem`.

This is an array of objects, each containing `index` and `unlockingScript` properties.

The `index` property is the output number in the transaction you are spending,
and `unlockingScript` is the hex scriptcode that unlocks the satoshis.

Note that you should create any signatures with `SIGHASH_NONE | ANYONECANPAY` or similar
so that the additional Dojo outputs can be added afterward without invalidating your signature.

```ts
inputs?: Record<string, NinjaTxInputsApi>
```

##### Interface NinjaGetTransactionWithOutputsParams Property labels

A set of label strings to affix to the transaction

```ts
labels?: string[]
```

##### Interface NinjaGetTransactionWithOutputsParams Property lockTime

A lock time for the transaction

```ts
lockTime?: number
```

##### Interface NinjaGetTransactionWithOutputsParams Property note

A note about the transaction

```ts
note?: string
```

##### Interface NinjaGetTransactionWithOutputsParams Property outputs

A set of outputs to include, each with `script` and `satoshis`.

```ts
outputs: DojoCreateTxOutputApi[]
```

##### Interface NinjaGetTransactionWithOutputsParams Property recipient

Paymail recipient for transaction

```ts
recipient?: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: ProcessIncomingTransactionInputApi

```ts
export interface ProcessIncomingTransactionInputApi {
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: ProcessIncomingTransactionOutputApi

```ts
export interface ProcessIncomingTransactionOutputApi {
    vout?: number;
    satoshis?: number;
    amount?: number;
    senderIdentityKey?: string;
    derivationSuffix?: string;
    derivationPrefix?: string;
    paymailHandle?: string;
}
```

<details>

<summary>Interface ProcessIncomingTransactionOutputApi Details</summary>

##### Interface ProcessIncomingTransactionOutputApi Property amount

```ts
amount?: number
```

##### Interface ProcessIncomingTransactionOutputApi Property derivationPrefix

```ts
derivationPrefix?: string
```

##### Interface ProcessIncomingTransactionOutputApi Property derivationSuffix

```ts
derivationSuffix?: string
```

##### Interface ProcessIncomingTransactionOutputApi Property paymailHandle

```ts
paymailHandle?: string
```

##### Interface ProcessIncomingTransactionOutputApi Property satoshis

```ts
satoshis?: number
```

##### Interface ProcessIncomingTransactionOutputApi Property senderIdentityKey

```ts
senderIdentityKey?: string
```

##### Interface ProcessIncomingTransactionOutputApi Property vout

```ts
vout?: number
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: ProcessIncomingTransactionApi

```ts
export interface ProcessIncomingTransactionApi {
    inputs?: Record<string, ProcessIncomingTransactionInputApi>;
    outputs: ProcessIncomingTransactionOutputApi[];
    referenceNumber?: string;
    rawTransaction?: string;
    rawTx?: string;
    derivationPrefix?: string;
}
```

<details>

<summary>Interface ProcessIncomingTransactionApi Details</summary>

##### Interface ProcessIncomingTransactionApi Property derivationPrefix

```ts
derivationPrefix?: string
```

##### Interface ProcessIncomingTransactionApi Property inputs

```ts
inputs?: Record<string, ProcessIncomingTransactionInputApi>
```

##### Interface ProcessIncomingTransactionApi Property outputs

```ts
outputs: ProcessIncomingTransactionOutputApi[]
```

##### Interface ProcessIncomingTransactionApi Property rawTransaction

```ts
rawTransaction?: string
```

##### Interface ProcessIncomingTransactionApi Property rawTx

```ts
rawTx?: string
```

##### Interface ProcessIncomingTransactionApi Property referenceNumber

```ts
referenceNumber?: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: ProcessIncomingTransactionResultApi

```ts
export interface ProcessIncomingTransactionResultApi {
    txid: string;
    amount: number;
    derivationPrefix?: string;
    senderIdentityKey?: string;
}
```

<details>

<summary>Interface ProcessIncomingTransactionResultApi Details</summary>

##### Interface ProcessIncomingTransactionResultApi Property amount

```ts
amount: number
```

##### Interface ProcessIncomingTransactionResultApi Property derivationPrefix

```ts
derivationPrefix?: string
```

##### Interface ProcessIncomingTransactionResultApi Property senderIdentityKey

```ts
senderIdentityKey?: string
```

##### Interface ProcessIncomingTransactionResultApi Property txid

```ts
txid: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: DojoTxBuilderInputApi

```ts
export interface DojoTxBuilderInputApi {
    txid: string;
    vout: number;
    satoshis: number;
    scriptLength: number;
    script?: string;
}
```

<details>

<summary>Interface DojoTxBuilderInputApi Details</summary>

##### Interface DojoTxBuilderInputApi Property satoshis

```ts
satoshis: number
```

##### Interface DojoTxBuilderInputApi Property script

```ts
script?: string
```

##### Interface DojoTxBuilderInputApi Property scriptLength

```ts
scriptLength: number
```

##### Interface DojoTxBuilderInputApi Property txid

```ts
txid: string
```

##### Interface DojoTxBuilderInputApi Property vout

```ts
vout: number
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: DojoTxBuilderOutputApi

```ts
export interface DojoTxBuilderOutputApi {
    satoshis: number;
    script: string;
    vout: number;
    index: number;
    change: boolean;
}
```

<details>

<summary>Interface DojoTxBuilderOutputApi Details</summary>

##### Interface DojoTxBuilderOutputApi Property change

```ts
change: boolean
```

##### Interface DojoTxBuilderOutputApi Property index

```ts
index: number
```

##### Interface DojoTxBuilderOutputApi Property satoshis

```ts
satoshis: number
```

##### Interface DojoTxBuilderOutputApi Property script

```ts
script: string
```

##### Interface DojoTxBuilderOutputApi Property vout

```ts
vout: number
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: DojoTxBuilderBaseOptions

```ts
export interface DojoTxBuilderBaseOptions {
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: NinjaTxBuilderOptions

```ts
export interface NinjaTxBuilderOptions extends DojoTxBuilderBaseOptions {
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: DojoExpressClientOptions

```ts
export interface DojoExpressClientOptions {
    authrite?: AuthriteClient;
    identityKey?: string;
}
```

<details>

<summary>Interface DojoExpressClientOptions Details</summary>

##### Interface DojoExpressClientOptions Property authrite

```ts
authrite?: AuthriteClient
```

##### Interface DojoExpressClientOptions Property identityKey

```ts
identityKey?: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: DojoTxBuilderOptions

```ts
export interface DojoTxBuilderOptions extends DojoTxBuilderBaseOptions {
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Interface: NinjaV1Params

```ts
export interface NinjaV1Params {
    privateKey?: string;
    config?: {
        dojoURL: string;
    };
    taalApiKeys?: {
        test: string;
        main: string;
    };
}
```

<details>

<summary>Interface NinjaV1Params Details</summary>

##### Interface NinjaV1Params Property config

```ts
config?: {
    dojoURL: string;
}
```

##### Interface NinjaV1Params Property privateKey

```ts
privateKey?: string
```

##### Interface NinjaV1Params Property taalApiKeys

```ts
taalApiKeys?: {
    test: string;
    main: string;
}
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
### Classes

| |
| --- |
| [DojoExpressClient](#class-dojoexpressclient) |
| [DojoTxBuilder](#class-dojotxbuilder) |
| [DojoTxBuilderBase](#class-dojotxbuilderbase) |
| [Ninja](#class-ninja) |
| [NinjaBase](#class-ninjabase) |
| [NinjaTxBuilder](#class-ninjatxbuilder) |
| [NinjaV2](#class-ninjav2) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---

#### Class: DojoTxBuilderBase

```ts
export class DojoTxBuilderBase {
    constructor(public dojo: DojoClientApi, public baseOptions?: DojoTxBuilderBaseOptions) 
    inputs: DojoTxBuilderInputApi[];
    outputs: DojoTxBuilderOutputApi[];
    outputsChange: DojoTxBuilderOutputApi[];
    funding(): number 
    spending(): number 
    change(): number 
    amount(): number 
    feeForSize(bytes: number): number 
    feeRequired(): number 
    feeExcess(): number 
    addOutputs(outputs: Array<DojoCreateTxOutputApi | DojoCreatingTxOutputApi | DojoTxBuilderOutputApi>): void 
    addChangeOutputs(outputs: Array<DojoCreateTxOutputApi | DojoCreatingTxOutputApi | DojoTxBuilderOutputApi>): void 
    addInputs(inputs: Record<string, DojoCreatingTxInputsApi>): void 
    addInputsToFundOutputs(inputs: DojoTxBuilderInputApi[]): void 
    addChangeOutputsToRecoverExcessFee(getChangeOutput: () => DojoTxBuilderOutputApi | undefined): void 
    validateOutput(o: DojoCreateTxOutputApi): void 
    validate(noThrow = false): {
        ok: boolean;
        error: CwiError | undefined;
    } 
}
```

<details>

<summary>Class DojoTxBuilderBase Details</summary>

##### Class DojoTxBuilderBase Constructor 

```ts
constructor(public dojo: DojoClientApi, public baseOptions?: DojoTxBuilderBaseOptions) 
```

##### Class DojoTxBuilderBase Property inputs

```ts
inputs: DojoTxBuilderInputApi[]
```

##### Class DojoTxBuilderBase Property outputs

```ts
outputs: DojoTxBuilderOutputApi[]
```

##### Class DojoTxBuilderBase Property outputsChange

```ts
outputsChange: DojoTxBuilderOutputApi[]
```

##### Class DojoTxBuilderBase Method addChangeOutputs

```ts
addChangeOutputs(outputs: Array<DojoCreateTxOutputApi | DojoCreatingTxOutputApi | DojoTxBuilderOutputApi>): void 
```

<details>

<summary>Class DojoTxBuilderBase Method addChangeOutputs Details</summary>

###### outputs

to add to transaction `outputsChange`

</details>

##### Class DojoTxBuilderBase Method addChangeOutputsToRecoverExcessFee

```ts
addChangeOutputsToRecoverExcessFee(getChangeOutput: () => DojoTxBuilderOutputApi | undefined): void 
```

<details>

<summary>Class DojoTxBuilderBase Method addChangeOutputsToRecoverExcessFee Details</summary>

###### getChangeOutput

a function that returns a single new change output or undefined if done.

</details>

##### Class DojoTxBuilderBase Method addInputs

```ts
addInputs(inputs: Record<string, DojoCreatingTxInputsApi>): void 
```

<details>

<summary>Class DojoTxBuilderBase Method addInputs Details</summary>

###### inputs

to add to transaction `inputs`

</details>

##### Class DojoTxBuilderBase Method addInputsToFundOutputs

```ts
addInputsToFundOutputs(inputs: DojoTxBuilderInputApi[]): void 
```

<details>

<summary>Class DojoTxBuilderBase Method addInputsToFundOutputs Details</summary>

###### inputs

to add to transaction `inputs`, removes inputs used from array

</details>

##### Class DojoTxBuilderBase Method addOutputs

```ts
addOutputs(outputs: Array<DojoCreateTxOutputApi | DojoCreatingTxOutputApi | DojoTxBuilderOutputApi>): void 
```

<details>

<summary>Class DojoTxBuilderBase Method addOutputs Details</summary>

###### outputs

to add to transaction `outputs`

</details>

##### Class DojoTxBuilderBase Method amount

```ts
amount(): number 
```

##### Class DojoTxBuilderBase Method change

```ts
change(): number 
```

##### Class DojoTxBuilderBase Method feeExcess

```ts
feeExcess(): number 
```

##### Class DojoTxBuilderBase Method feeForSize

```ts
feeForSize(bytes: number): number 
```

<details>

<summary>Class DojoTxBuilderBase Method feeForSize Details</summary>

###### bytes

size in bytes

</details>

##### Class DojoTxBuilderBase Method feeRequired

```ts
feeRequired(): number 
```

##### Class DojoTxBuilderBase Method funding

```ts
funding(): number 
```

##### Class DojoTxBuilderBase Method spending

```ts
spending(): number 
```

##### Class DojoTxBuilderBase Method validate

```ts
validate(noThrow = false): {
    ok: boolean;
    error: CwiError | undefined;
} 
```

##### Class DojoTxBuilderBase Method validateOutput

```ts
validateOutput(o: DojoCreateTxOutputApi): void 
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Class: NinjaTxBuilder

##### Description

NinjaTxBuilder is intended to complement DojoTxBuilder, implementing the signing functions
that only Ninja can do with access to private keys.

Ultimately most of the generically useful code that supports building and signing
actual bitcoin transactions should be collected here.

This is a work in progress...

```ts
export class NinjaTxBuilder extends DojoTxBuilderBase {
    constructor(public ninja: NinjaApi, public options?: NinjaTxBuilderOptions) 
    static buildJsTxFromPendingTx(ninja: NinjaBase, ptx: DojoPendingTxApi): {
        tx: bsvJs.Transaction;
        outputMap: Record<string, number>;
        amount: number;
    } 
    static buildJsTxFromCreateTransactionResult(ninja: NinjaApi, inputs: Record<string, NinjaTxInputsApi>, createResult: DojoCreateTransactionResultApi, lockTime?: number): {
        tx: bsvJs.Transaction;
        outputMap: Record<string, number>;
        amount: number;
    } 
    static buildJsTx(ninja: NinjaApi, inputs: Record<string, NinjaTxInputsApi>, txInputs: Record<string, DojoCreatingTxInputsApi>, txOutputs: DojoCreatingTxOutputApi[], derivationPrefix: string, paymailHandle?: string, lockTime?: number): {
        tx: bsvJs.Transaction;
        outputMap: Record<string, number>;
        amount: number;
    } 
}
```

<details>

<summary>Class NinjaTxBuilder Details</summary>

##### Class NinjaTxBuilder Constructor 

```ts
constructor(public ninja: NinjaApi, public options?: NinjaTxBuilderOptions) 
```

##### Class NinjaTxBuilder Method buildJsTx

```ts
static buildJsTx(ninja: NinjaApi, inputs: Record<string, NinjaTxInputsApi>, txInputs: Record<string, DojoCreatingTxInputsApi>, txOutputs: DojoCreatingTxOutputApi[], derivationPrefix: string, paymailHandle?: string, lockTime?: number): {
    tx: bsvJs.Transaction;
    outputMap: Record<string, number>;
    amount: number;
} 
```

##### Class NinjaTxBuilder Method buildJsTxFromCreateTransactionResult

```ts
static buildJsTxFromCreateTransactionResult(ninja: NinjaApi, inputs: Record<string, NinjaTxInputsApi>, createResult: DojoCreateTransactionResultApi, lockTime?: number): {
    tx: bsvJs.Transaction;
    outputMap: Record<string, number>;
    amount: number;
} 
```

##### Class NinjaTxBuilder Method buildJsTxFromPendingTx

```ts
static buildJsTxFromPendingTx(ninja: NinjaBase, ptx: DojoPendingTxApi): {
    tx: bsvJs.Transaction;
    outputMap: Record<string, number>;
    amount: number;
} 
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Class: NinjaBase

```ts
export class NinjaBase implements NinjaApi {
    chain?: Chain;
    _keyPair: KeyPairApi | undefined;
    _isDojoAuthenticated: boolean;
    constructor(public dojo: DojoClientApi, clientPrivateKey?: string, public authrite?: AuthriteClient) 
    getClientChangeKeyPair(): KeyPairApi 
    async authenticate(identityKey?: string, addIfNew?: boolean): Promise<void> 
    async verifyDojoAuthenticated() 
    async sync(): Promise<void> 
    async setSyncDojosByConfig(syncDojoConfigs: SyncDojoConfigBaseApi[], options?: DojoSyncOptionsApi | undefined): Promise<void> 
    async getSyncDojosByConfig(): Promise<{
        dojos: SyncDojoConfigBaseApi[];
        options?: DojoSyncOptionsApi | undefined;
    }> 
    async getPaymail(): Promise<string> 
    async setPaymail(paymail: string): Promise<void> 
    async getChain(): Promise<Chain> 
    async getNetwork(format?: "default" | "nonet"): Promise<string> 
    async findCertificates(certifiers?: string[] | object, types?: Record<string, string[]>): Promise<{
        status: "success";
        certificates: DojoCertificateApi[];
    }> 
    async saveCertificate(certificate: DojoCertificateApi | object): Promise<void> 
    async getTotalValue(basket?: string): Promise<{
        total: number;
    }> 
    async getTotalOfAmounts(options: DojoGetTotalOfAmountsOptions): Promise<{
        total: number;
    }> 
    async getNetOfAmounts(options?: DojoGetTotalOfAmountsOptions | undefined): Promise<number> 
    async getAvatar(): Promise<DojoAvatarApi> 
    async setAvatar(name: string, photoURL: string): Promise<void> 
    async updateTransactionStatus(params: {
        reference: string;
        status: DojoTransactionStatusApi;
    }): Promise<void> 
    async updateOutpointStatus(params: {
        txid: string;
        vout: number;
        spendable: boolean;
    }): Promise<void> 
    async getTransactions(options?: DojoGetTransactionsOptions): Promise<NinjaGetTransactionsResultApi> 
    async getPendingTransactions(referenceNumber?: string): Promise<DojoPendingTxApi[]> 
    async processPendingTransactions(onTransactionProcessed?: NinjaTransactionProcessedHandler, onTransactionFailed?: NinjaTransactionFailedHandler): Promise<void> 
    async getTransactionOutputs(options?: DojoGetTransactionOutputsOptions): Promise<NinjaGetTransactionOutputsResultApi[]> 
    async processTransaction(params: {
        submittedTransaction: string | Buffer;
        reference: string;
        outputMap: Record<string, number>;
    }): Promise<DojoProcessTransactionResultApi> 
    async getTransactionWithOutputs(params: {
        outputs: DojoCreateTxOutputApi[];
        labels?: string[];
        inputs?: Record<string, NinjaTxInputsApi>;
        note?: string;
        recipient?: string;
        autoProcess?: boolean | undefined;
        feePerKb?: number | undefined;
    }): Promise<NinjaGetTxWithOutputsResultApi | NinjaGetTxWithOutputsProcessedResultApi> 
    async createTransaction(params: NinjaCreateTransactionParams): Promise<DojoCreateTransactionResultApi> 
    async submitDirectTransaction(params: NinjaSubmitDirectTransactionParams): Promise<NinjaSubmitDirectTransactionResultApi> 
}
```

<details>

<summary>Class NinjaBase Details</summary>

##### Class NinjaBase Constructor 

```ts
constructor(public dojo: DojoClientApi, clientPrivateKey?: string, public authrite?: AuthriteClient) 
```

##### Class NinjaBase Property _isDojoAuthenticated

```ts
_isDojoAuthenticated: boolean
```

##### Class NinjaBase Property _keyPair

```ts
_keyPair: KeyPairApi | undefined
```

##### Class NinjaBase Property chain

```ts
chain?: Chain
```

##### Class NinjaBase Method authenticate

```ts
async authenticate(identityKey?: string, addIfNew?: boolean): Promise<void> 
```

##### Class NinjaBase Method createTransaction

```ts
async createTransaction(params: NinjaCreateTransactionParams): Promise<DojoCreateTransactionResultApi> 
```

##### Class NinjaBase Method findCertificates

```ts
async findCertificates(certifiers?: string[] | object, types?: Record<string, string[]>): Promise<{
    status: "success";
    certificates: DojoCertificateApi[];
}> 
```

##### Class NinjaBase Method getAvatar

```ts
async getAvatar(): Promise<DojoAvatarApi> 
```

##### Class NinjaBase Method getChain

```ts
async getChain(): Promise<Chain> 
```

##### Class NinjaBase Method getClientChangeKeyPair

```ts
getClientChangeKeyPair(): KeyPairApi 
```

##### Class NinjaBase Method getNetOfAmounts

```ts
async getNetOfAmounts(options?: DojoGetTotalOfAmountsOptions | undefined): Promise<number> 
```

##### Class NinjaBase Method getNetwork

```ts
async getNetwork(format?: "default" | "nonet"): Promise<string> 
```

##### Class NinjaBase Method getPaymail

```ts
async getPaymail(): Promise<string> 
```

##### Class NinjaBase Method getPendingTransactions

```ts
async getPendingTransactions(referenceNumber?: string): Promise<DojoPendingTxApi[]> 
```

##### Class NinjaBase Method getSyncDojosByConfig

```ts
async getSyncDojosByConfig(): Promise<{
    dojos: SyncDojoConfigBaseApi[];
    options?: DojoSyncOptionsApi | undefined;
}> 
```

##### Class NinjaBase Method getTotalOfAmounts

```ts
async getTotalOfAmounts(options: DojoGetTotalOfAmountsOptions): Promise<{
    total: number;
}> 
```

##### Class NinjaBase Method getTotalValue

```ts
async getTotalValue(basket?: string): Promise<{
    total: number;
}> 
```

##### Class NinjaBase Method getTransactionOutputs

```ts
async getTransactionOutputs(options?: DojoGetTransactionOutputsOptions): Promise<NinjaGetTransactionOutputsResultApi[]> 
```

##### Class NinjaBase Method getTransactionWithOutputs

```ts
async getTransactionWithOutputs(params: {
    outputs: DojoCreateTxOutputApi[];
    labels?: string[];
    inputs?: Record<string, NinjaTxInputsApi>;
    note?: string;
    recipient?: string;
    autoProcess?: boolean | undefined;
    feePerKb?: number | undefined;
}): Promise<NinjaGetTxWithOutputsResultApi | NinjaGetTxWithOutputsProcessedResultApi> 
```

##### Class NinjaBase Method getTransactions

```ts
async getTransactions(options?: DojoGetTransactionsOptions): Promise<NinjaGetTransactionsResultApi> 
```

##### Class NinjaBase Method processPendingTransactions

```ts
async processPendingTransactions(onTransactionProcessed?: NinjaTransactionProcessedHandler, onTransactionFailed?: NinjaTransactionFailedHandler): Promise<void> 
```

##### Class NinjaBase Method processTransaction

```ts
async processTransaction(params: {
    submittedTransaction: string | Buffer;
    reference: string;
    outputMap: Record<string, number>;
}): Promise<DojoProcessTransactionResultApi> 
```

##### Class NinjaBase Method saveCertificate

```ts
async saveCertificate(certificate: DojoCertificateApi | object): Promise<void> 
```

##### Class NinjaBase Method setAvatar

```ts
async setAvatar(name: string, photoURL: string): Promise<void> 
```

##### Class NinjaBase Method setPaymail

```ts
async setPaymail(paymail: string): Promise<void> 
```

##### Class NinjaBase Method setSyncDojosByConfig

```ts
async setSyncDojosByConfig(syncDojoConfigs: SyncDojoConfigBaseApi[], options?: DojoSyncOptionsApi | undefined): Promise<void> 
```

##### Class NinjaBase Method submitDirectTransaction

```ts
async submitDirectTransaction(params: NinjaSubmitDirectTransactionParams): Promise<NinjaSubmitDirectTransactionResultApi> 
```

##### Class NinjaBase Method sync

```ts
async sync(): Promise<void> 
```

##### Class NinjaBase Method updateOutpointStatus

```ts
async updateOutpointStatus(params: {
    txid: string;
    vout: number;
    spendable: boolean;
}): Promise<void> 
```

##### Class NinjaBase Method updateTransactionStatus

```ts
async updateTransactionStatus(params: {
    reference: string;
    status: DojoTransactionStatusApi;
}): Promise<void> 
```

##### Class NinjaBase Method verifyDojoAuthenticated

```ts
async verifyDojoAuthenticated() 
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Class: DojoExpressClient

##### Description

Connects to a DojoExpress to implement `DojoApi`

```ts
export class DojoExpressClient implements DojoClientApi {
    static createDojoExpressClientOptions(): DojoExpressClientOptions 
    authrite?: AuthriteClient;
    options: DojoExpressClientOptions;
    get userId(): number 
    get identityKey(): string 
    get isAuthenticated(): boolean 
    syncDojoConfig?: SyncDojoConfigBaseApi;
    constructor(public chain: Chain, public serviceUrl: string, options?: DojoExpressClientOptions) 
    async getChain(): Promise<Chain> 
    async stats(): Promise<DojoStatsApi> 
    async getDojoIdentity(): Promise<DojoIdentityApi> 
    async authenticate(identityKey?: string, addIfNew?: boolean): Promise<void> 
    getUser(): DojoClientUserApi 
    async verifyAuthenticated(): Promise<void> 
    async getSyncDojoConfig(): Promise<SyncDojoConfigBaseApi> 
    setSyncDojos(dojos: DojoSyncApi[], syncOptions?: DojoSyncOptionsApi | undefined): void 
    getSyncDojos(): {
        dojos: DojoSyncApi[];
        options: DojoSyncOptionsApi;
    } 
    async setSyncDojosByConfig(syncDojoConfigs: SyncDojoConfigBaseApi[], options?: DojoSyncOptionsApi | undefined): Promise<void> 
    async getSyncDojosByConfig(): Promise<{
        dojos: SyncDojoConfigBaseApi[];
        options?: DojoSyncOptionsApi | undefined;
    }> 
    async sync(): Promise<void> 
    async syncIdentify(params: DojoSyncIdentifyParams): Promise<DojoSyncIdentifyResultApi> 
    async syncUpdate(params: DojoSyncUpdateParams): Promise<DojoSyncUpdateResultApi> 
    async syncMerge(params: DojoSyncMergeParams): Promise<DojoSyncMergeResultApi> 
    async getCurrentPaymails(): Promise<string[]> 
    async getAvatar(): Promise<DojoAvatarApi> 
    async setAvatar(avatar: DojoAvatarApi): Promise<void> 
    async saveCertificate(certificate: DojoCertificateApi): Promise<number> 
    async findCertificates(certifiers?: string[], types?: Record<string, string[]>): Promise<DojoCertificateApi[]> 
    async getTotalOfUnspentOutputs(basket?: string): Promise<number | undefined> 
    async updateOutpointStatus(txid: string, vout: number, spendable: boolean): Promise<void> 
    async getTotalOfAmounts(direction: "incoming" | "outgoing", options?: DojoGetTotalOfAmountsOptions): Promise<number> 
    async getNetOfAmounts(options?: DojoGetTotalOfAmountsOptions): Promise<number> 
    async updateTransactionStatus(reference: string, status: DojoTransactionStatusApi): Promise<void> 
    async getTransactions(options?: DojoGetTransactionsOptions): Promise<{
        txs: DojoTransactionApi[];
        total: number;
    }> 
    async getPendingTransactions(referenceNumber?: string): Promise<DojoPendingTxApi[]> 
    async getEnvelopeForTransaction(txid: string): Promise<EnvelopeApi | undefined> 
    async getTransactionOutputs(options?: DojoGetTransactionOutputsOptions): Promise<{
        outputs: DojoOutputApi[];
        total: number;
    }> 
    async createTransaction(inputs: Record<string, DojoTxInputsApi>, inputSelection: DojoTxInputSelectionApi | undefined, outputs: DojoCreateTxOutputApi[], outputGeneration?: DojoOutputGenerationApi, feeModel?: DojoFeeModelApi, labels?: string[] | undefined, note?: string | undefined, recipient?: string | undefined): Promise<DojoCreateTransactionResultApi> 
    async processTransaction(rawTx: string | Buffer, reference: string, outputMap: Record<string, number>): Promise<DojoProcessTransactionResultApi> 
    async submitDirectTransaction(protocol: string, transaction: DojoSubmitDirectTransactionApi, senderIdentityKey: string, note: string, labels: string[], derivationPrefix?: string): Promise<DojoSubmitDirectTransactionResultApi> 
    async copyState(): Promise<DojoUserStateApi> 
    async getJsonOrUndefined<T>(path: string): Promise<T | undefined> 
    async getJson<T>(path: string): Promise<T> 
    async postJsonOrUndefined<T, R>(path: string, params: T, noAuth?: boolean): Promise<R | undefined> 
    async postJson<T, R>(path: string, params: T, noAuth?: boolean): Promise<R> 
    async postJsonVoid<T>(path: string, params: T, noAuth?: boolean): Promise<void> 
}
```

<details>

<summary>Class DojoExpressClient Details</summary>

##### Class DojoExpressClient Constructor 

```ts
constructor(public chain: Chain, public serviceUrl: string, options?: DojoExpressClientOptions) 
```

##### Class DojoExpressClient Property authrite

```ts
authrite?: AuthriteClient
```

##### Class DojoExpressClient Property options

```ts
options: DojoExpressClientOptions
```

##### Class DojoExpressClient Property syncDojoConfig

Only vaild if this dojo was created as a syncDojo by setSyncDojosByConfig

```ts
syncDojoConfig?: SyncDojoConfigBaseApi
```

##### Class DojoExpressClient Method authenticate

```ts
async authenticate(identityKey?: string, addIfNew?: boolean): Promise<void> 
```

##### Class DojoExpressClient Method copyState

```ts
async copyState(): Promise<DojoUserStateApi> 
```

##### Class DojoExpressClient Method createDojoExpressClientOptions

```ts
static createDojoExpressClientOptions(): DojoExpressClientOptions 
```

##### Class DojoExpressClient Method createTransaction

```ts
async createTransaction(inputs: Record<string, DojoTxInputsApi>, inputSelection: DojoTxInputSelectionApi | undefined, outputs: DojoCreateTxOutputApi[], outputGeneration?: DojoOutputGenerationApi, feeModel?: DojoFeeModelApi, labels?: string[] | undefined, note?: string | undefined, recipient?: string | undefined): Promise<DojoCreateTransactionResultApi> 
```

##### Class DojoExpressClient Method findCertificates

```ts
async findCertificates(certifiers?: string[], types?: Record<string, string[]>): Promise<DojoCertificateApi[]> 
```

##### Class DojoExpressClient Method getAvatar

```ts
async getAvatar(): Promise<DojoAvatarApi> 
```

##### Class DojoExpressClient Method getChain

```ts
async getChain(): Promise<Chain> 
```

##### Class DojoExpressClient Method getCurrentPaymails

```ts
async getCurrentPaymails(): Promise<string[]> 
```

##### Class DojoExpressClient Method getDojoIdentity

```ts
async getDojoIdentity(): Promise<DojoIdentityApi> 
```

##### Class DojoExpressClient Method getEnvelopeForTransaction

```ts
async getEnvelopeForTransaction(txid: string): Promise<EnvelopeApi | undefined> 
```

##### Class DojoExpressClient Method getJson

```ts
async getJson<T>(path: string): Promise<T> 
```

##### Class DojoExpressClient Method getJsonOrUndefined

```ts
async getJsonOrUndefined<T>(path: string): Promise<T | undefined> 
```

##### Class DojoExpressClient Method getNetOfAmounts

```ts
async getNetOfAmounts(options?: DojoGetTotalOfAmountsOptions): Promise<number> 
```

##### Class DojoExpressClient Method getPendingTransactions

```ts
async getPendingTransactions(referenceNumber?: string): Promise<DojoPendingTxApi[]> 
```

##### Class DojoExpressClient Method getSyncDojoConfig

```ts
async getSyncDojoConfig(): Promise<SyncDojoConfigBaseApi> 
```

##### Class DojoExpressClient Method getSyncDojos

```ts
getSyncDojos(): {
    dojos: DojoSyncApi[];
    options: DojoSyncOptionsApi;
} 
```

##### Class DojoExpressClient Method getSyncDojosByConfig

```ts
async getSyncDojosByConfig(): Promise<{
    dojos: SyncDojoConfigBaseApi[];
    options?: DojoSyncOptionsApi | undefined;
}> 
```

##### Class DojoExpressClient Method getTotalOfAmounts

```ts
async getTotalOfAmounts(direction: "incoming" | "outgoing", options?: DojoGetTotalOfAmountsOptions): Promise<number> 
```

##### Class DojoExpressClient Method getTotalOfUnspentOutputs

```ts
async getTotalOfUnspentOutputs(basket?: string): Promise<number | undefined> 
```

##### Class DojoExpressClient Method getTransactionOutputs

```ts
async getTransactionOutputs(options?: DojoGetTransactionOutputsOptions): Promise<{
    outputs: DojoOutputApi[];
    total: number;
}> 
```

##### Class DojoExpressClient Method getTransactions

```ts
async getTransactions(options?: DojoGetTransactionsOptions): Promise<{
    txs: DojoTransactionApi[];
    total: number;
}> 
```

##### Class DojoExpressClient Method getUser

```ts
getUser(): DojoClientUserApi 
```

##### Class DojoExpressClient Method postJson

```ts
async postJson<T, R>(path: string, params: T, noAuth?: boolean): Promise<R> 
```

##### Class DojoExpressClient Method postJsonOrUndefined

```ts
async postJsonOrUndefined<T, R>(path: string, params: T, noAuth?: boolean): Promise<R | undefined> 
```

##### Class DojoExpressClient Method postJsonVoid

```ts
async postJsonVoid<T>(path: string, params: T, noAuth?: boolean): Promise<void> 
```

##### Class DojoExpressClient Method processTransaction

```ts
async processTransaction(rawTx: string | Buffer, reference: string, outputMap: Record<string, number>): Promise<DojoProcessTransactionResultApi> 
```

##### Class DojoExpressClient Method saveCertificate

```ts
async saveCertificate(certificate: DojoCertificateApi): Promise<number> 
```

##### Class DojoExpressClient Method setAvatar

```ts
async setAvatar(avatar: DojoAvatarApi): Promise<void> 
```

##### Class DojoExpressClient Method setSyncDojos

```ts
setSyncDojos(dojos: DojoSyncApi[], syncOptions?: DojoSyncOptionsApi | undefined): void 
```

##### Class DojoExpressClient Method setSyncDojosByConfig

```ts
async setSyncDojosByConfig(syncDojoConfigs: SyncDojoConfigBaseApi[], options?: DojoSyncOptionsApi | undefined): Promise<void> 
```

##### Class DojoExpressClient Method stats

```ts
async stats(): Promise<DojoStatsApi> 
```

##### Class DojoExpressClient Method submitDirectTransaction

```ts
async submitDirectTransaction(protocol: string, transaction: DojoSubmitDirectTransactionApi, senderIdentityKey: string, note: string, labels: string[], derivationPrefix?: string): Promise<DojoSubmitDirectTransactionResultApi> 
```

##### Class DojoExpressClient Method sync

```ts
async sync(): Promise<void> 
```

##### Class DojoExpressClient Method syncIdentify

```ts
async syncIdentify(params: DojoSyncIdentifyParams): Promise<DojoSyncIdentifyResultApi> 
```

##### Class DojoExpressClient Method syncMerge

```ts
async syncMerge(params: DojoSyncMergeParams): Promise<DojoSyncMergeResultApi> 
```

##### Class DojoExpressClient Method syncUpdate

```ts
async syncUpdate(params: DojoSyncUpdateParams): Promise<DojoSyncUpdateResultApi> 
```

##### Class DojoExpressClient Method updateOutpointStatus

```ts
async updateOutpointStatus(txid: string, vout: number, spendable: boolean): Promise<void> 
```

##### Class DojoExpressClient Method updateTransactionStatus

```ts
async updateTransactionStatus(reference: string, status: DojoTransactionStatusApi): Promise<void> 
```

##### Class DojoExpressClient Method verifyAuthenticated

```ts
async verifyAuthenticated(): Promise<void> 
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Class: DojoTxBuilder

```ts
export class DojoTxBuilder extends DojoTxBuilderBase {
    constructor(dojo: DojoClientApi, public options?: DojoTxBuilderOptions) 
}
```

<details>

<summary>Class DojoTxBuilder Details</summary>

##### Class DojoTxBuilder Constructor 

```ts
constructor(dojo: DojoClientApi, public options?: DojoTxBuilderOptions) 
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Class: Ninja

##### Description

"Drop-in-replacement" for the original (v1) Ninja

```ts
export class Ninja extends NinjaBase {
    constructor(dojo: NinjaV1Params | DojoClientApi, clientPrivateKey?: string, authrite?: AuthriteClient) 
}
```

<details>

<summary>Class Ninja Details</summary>

##### Class Ninja Constructor 

```ts
constructor(dojo: NinjaV1Params | DojoClientApi, clientPrivateKey?: string, authrite?: AuthriteClient) 
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Class: NinjaV2

##### Description

A ninja that also creates a default DojoClientExpress syncDojo configured to sync an existing user's state
from a dojoURL parameter (either https://staging-dojo.babbage.systems or https://dojo.babbage.systems by default)

```ts
export class NinjaV2 extends NinjaBase {
    constructor(dojo: DojoClientApi, clientPrivateKey: string, chain: Chain) 
}
```

<details>

<summary>Class NinjaV2 Details</summary>

##### Class NinjaV2 Constructor 

```ts
constructor(dojo: DojoClientApi, clientPrivateKey: string, chain: Chain) 
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
### Functions

| |
| --- |
| [getTransactionWithOutputs](#function-gettransactionwithoutputs) |
| [invoice3241645161d8](#function-invoice3241645161d8) |
| [processIncomingTransaction](#function-processincomingtransaction) |
| [processPendingTransactions](#function-processpendingtransactions) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---

#### Function: invoice3241645161d8

##### Description

Combine inputs per protocol 3241645161d8 to generate an 'invoice' string used for cryptographic key generation.

```ts
export function invoice3241645161d8(prefix: string, suffix: string, paymail?: string): string 
```

<details>

<summary>Function invoice3241645161d8 Details</summary>

###### prefix

Typically a random string unique to a single transaction.###### suffix

Typically a random string unique to a single output in that transaction.###### paymail

An optional paymail handle</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Function: processIncomingTransaction

##### Description

Verifies protocol '3241645161d8' output scripts with derivedSuffix based addresses.
Computes transaction 'amount'.

```ts
export async function processIncomingTransaction(ninja: NinjaBase, incomingTransaction: ProcessIncomingTransactionApi, protocol?: string, updateStatus?: boolean): Promise<ProcessIncomingTransactionResultApi> 
```

<details>

<summary>Function processIncomingTransaction Details</summary>

##### Returns

Void on error if onTransactionFailed handler is provided.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Function: processPendingTransactions

```ts
export async function processPendingTransactions(ninja: NinjaBase, onTransactionProcessed?: NinjaTransactionProcessedHandler, onTransactionFailed?: NinjaTransactionFailedHandler): Promise<void> 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Function: getTransactionWithOutputs

```ts
export async function getTransactionWithOutputs(ninja: NinjaBase, outputs: DojoCreateTxOutputApi[], labels?: string[], inputs?: Record<string, NinjaTxInputsApi>, note?: string, recipient?: string, autoProcess?: boolean, feePerKb?: number, lockTime?: number): Promise<NinjaGetTxWithOutputsResultApi | NinjaGetTxWithOutputsProcessedResultApi> 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
### Types

| |
| --- |
| [NinjaTransactionFailedHandler](#type-ninjatransactionfailedhandler) |
| [NinjaTransactionProcessedHandler](#type-ninjatransactionprocessedhandler) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---

#### Type: NinjaTransactionFailedHandler

```ts
export type NinjaTransactionFailedHandler = (args: NinjaTransactionFailedApi) => Promise<void>
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---
#### Type: NinjaTransactionProcessedHandler

```ts
export type NinjaTransactionProcessedHandler = (args: NinjaTransactionProcessedApi) => Promise<void>
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types)

---

<!--#endregion ts2md-api-merged-here-->

## License

The license for the code in this repository is the Open BSV License.