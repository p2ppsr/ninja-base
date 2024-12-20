# ninja-base

Base level functions, classes, interfaces for Ninja

## API

<!--#region ts2md-api-merged-here-->

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

### Interfaces

| | | |
| --- | --- | --- |
| [CwiCoreApi](#interface-cwicoreapi) | [NinjaGetTransactionOutputsResultApi](#interface-ninjagettransactionoutputsresultapi) | [NinjaTransactionFailedApi](#interface-ninjatransactionfailedapi) |
| [DojoExpressClientOptions](#interface-dojoexpressclientoptions) | [NinjaGetTransactionWithOutputsParams](#interface-ninjagettransactionwithoutputsparams) | [NinjaTransactionProcessedApi](#interface-ninjatransactionprocessedapi) |
| [KeyPairApi](#interface-keypairapi) | [NinjaGetTransactionsResultApi](#interface-ninjagettransactionsresultapi) | [NinjaTransactionWithOutputsResultApi](#interface-ninjatransactionwithoutputsresultapi) |
| [NinjaAbortActionParams](#interface-ninjaabortactionparams) | [NinjaGetTransactionsTxApi](#interface-ninjagettransactionstxapi) | [NinjaTxInputsApi](#interface-ninjatxinputsapi) |
| [NinjaAbortActionResultApi](#interface-ninjaabortactionresultapi) | [NinjaGetTransactionsTxInputApi](#interface-ninjagettransactionstxinputapi) | [NinjaV1Params](#interface-ninjav1params) |
| [NinjaApi](#interface-ninjaapi) | [NinjaGetTransactionsTxOutputApi](#interface-ninjagettransactionstxoutputapi) | [PendingDojoInput](#interface-pendingdojoinput) |
| [NinjaCompleteCreateTransactionWithOutputsParams](#interface-ninjacompletecreatetransactionwithoutputsparams) | [NinjaOutputToRedeemApi](#interface-ninjaoutputtoredeemapi) | [PendingSignAction](#interface-pendingsignaction) |
| [NinjaCreateActionConfirmResult](#interface-ninjacreateactionconfirmresult) | [NinjaSignActionParams](#interface-ninjasignactionparams) | [ProcessIncomingTransactionApi](#interface-processincomingtransactionapi) |
| [NinjaCreateActionParams](#interface-ninjacreateactionparams) | [NinjaSignActionResultApi](#interface-ninjasignactionresultapi) | [ProcessIncomingTransactionInputApi](#interface-processincomingtransactioninputapi) |
| [NinjaCreateActionResult](#interface-ninjacreateactionresult) | [NinjaSignCreatedTransactionParams](#interface-ninjasigncreatedtransactionparams) | [ProcessIncomingTransactionOutputApi](#interface-processincomingtransactionoutputapi) |
| [NinjaCreateTransactionParams](#interface-ninjacreatetransactionparams) | [NinjaSubmitDirectTransactionApi](#interface-ninjasubmitdirecttransactionapi) | [ProcessIncomingTransactionResultApi](#interface-processincomingtransactionresultapi) |
| [NinjaGetPendingTransactionsInputApi](#interface-ninjagetpendingtransactionsinputapi) | [NinjaSubmitDirectTransactionOutputApi](#interface-ninjasubmitdirecttransactionoutputapi) | [SignActionParams](#interface-signactionparams) |
| [NinjaGetPendingTransactionsInstructionsApi](#interface-ninjagetpendingtransactionsinstructionsapi) | [NinjaSubmitDirectTransactionParams](#interface-ninjasubmitdirecttransactionparams) | [TxOutputApi](#interface-txoutputapi) |
| [NinjaGetPendingTransactionsTxApi](#interface-ninjagetpendingtransactionstxapi) | [NinjaSubmitDirectTransactionResultApi](#interface-ninjasubmitdirecttransactionresultapi) | [TxRedeemableOutputApi](#interface-txredeemableoutputapi) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: CwiCoreApi

Starting point for cwi-core's typescript api.

Supports design and testing.

```ts
export interface CwiCoreApi {
    createAction(params: CreateActionParams): Promise<CreateActionResult>;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: DojoExpressClientOptions

```ts
export interface DojoExpressClientOptions {
    authrite?: AuthriteClient;
    identityKey?: string;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: KeyPairApi

```ts
export interface KeyPairApi {
    privateKey: string;
    publicKey: string;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: NinjaAbortActionParams

```ts
export interface NinjaAbortActionParams {
    referenceNumber: string;
    log: string | undefined;
}
```

<details>

<summary>Interface NinjaAbortActionParams Details</summary>

##### Property log

Optional operational and performance logging prior data.

```ts
log: string | undefined
```

##### Property referenceNumber

unique transaction identifier previously returned by createAction when at least one unlockingScript
was specified by max script byte length.

The status of the transaction identified by `referenceNumber` must be `unsigned`.

```ts
referenceNumber: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: NinjaAbortActionResultApi

```ts
export interface NinjaAbortActionResultApi {
    referenceNumber: string;
    log: string | undefined;
}
```

<details>

<summary>Interface NinjaAbortActionResultApi Details</summary>

##### Property log

operational and performance logging if enabled.

```ts
log: string | undefined
```

##### Property referenceNumber

The unique transaction identifier that was processed.

```ts
referenceNumber: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: NinjaApi

A client for creating, signing, and delivering Bitcoin transactions

```ts
export interface NinjaApi {
    dojo: DojoClientApi;
    authenticate(identityKey?: string, addIfNew?: boolean): Promise<void>;
    isAuthenticated(): boolean;
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
    getTransactionLabels(options?: DojoGetTransactionLabelsOptions): Promise<{
        labels: DojoTxLabelApi[];
        total: number;
    }>;
    getEnvelopeForTransaction(txid: string): Promise<EnvelopeApi | undefined>;
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
    createAction(params: NinjaCreateActionParams): Promise<NinjaCreateActionResult>;
    processPendingTransactions(onTransactionProcessed?: NinjaTransactionProcessedHandler, onTransactionFailed?: NinjaTransactionFailedHandler): Promise<void>;
    processTransaction(params: DojoProcessTransactionParams): Promise<DojoProcessTransactionResultApi>;
    getTransactionWithOutputs(params: NinjaGetTransactionWithOutputsParams): Promise<NinjaTransactionWithOutputsResultApi>;
    createTransactionWithOutputs(params: NinjaGetTransactionWithOutputsParams): Promise<NinjaTransactionWithOutputsResultApi>;
    processTransactionWithOutputs(params: NinjaGetTransactionWithOutputsParams): Promise<NinjaTransactionWithOutputsResultApi>;
    signAction(params: NinjaSignActionParams): Promise<NinjaSignActionResultApi>;
    abortAction(params: NinjaAbortActionParams): Promise<NinjaAbortActionResultApi>;
    createTransaction(params: NinjaCreateTransactionParams): Promise<DojoCreateTransactionResultApi>;
    submitDirectTransaction(params: NinjaSubmitDirectTransactionParams): Promise<NinjaSubmitDirectTransactionResultApi>;
    deleteCertificate(partial: Partial<DojoCertificateApi>): Promise<number>;
    labelTransaction(txid: string | number | Partial<DojoTransactionApi>, label: string): Promise<void>;
    unlabelTransaction(txid: string | number | Partial<DojoTransactionApi>, label: string): Promise<void>;
    tagOutput(output: {
        txid: string;
        vout: number;
    }, tag: string): Promise<void>;
    untagOutput(output: {
        txid: string;
        vout: number;
    }, tag: string): Promise<void>;
    unbasketOutput(output: {
        txid: string;
        vout: number;
    }): Promise<void>;
    getEnvelopesOfConflictingTransactions(txid: string): Promise<EnvelopeApi[]>;
    getHeight(): Promise<number>;
    getMerkleRootForHeight(height: number): Promise<string | undefined>;
    getHeaderForHeight(height: number): Promise<number[] | undefined>;
    getInfo(params: GetInfoParams): Promise<GetInfoResult>;
    listActions(vargs: sdk.ValidListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListActionsResult>;
    listOutputs(vargs: sdk.ValidListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListOutputsResult>;
    createActionSdk(vargs: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.CreateActionResult>;
    signActionSdk(vargs: sdk.ValidSignActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.SignActionResult>;
    abortActionSdk(vargs: sdk.ValidAbortActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.AbortActionResult>;
    internalizeActionSdk(vargs: sdk.ValidInternalizeActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.InternalizeActionResult>;
    relinquishOutputSdk(vargs: sdk.ValidRelinquishOutputArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.RelinquishOutputResult>;
    listCertificatesSdk(vargs: sdk.ValidListCertificatesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListCertificatesResult>;
}
```

See also: [KeyPairApi](#interface-keypairapi), [NinjaAbortActionParams](#interface-ninjaabortactionparams), [NinjaAbortActionResultApi](#interface-ninjaabortactionresultapi), [NinjaCreateActionParams](#interface-ninjacreateactionparams), [NinjaCreateActionResult](#interface-ninjacreateactionresult), [NinjaCreateTransactionParams](#interface-ninjacreatetransactionparams), [NinjaGetTransactionOutputsResultApi](#interface-ninjagettransactionoutputsresultapi), [NinjaGetTransactionWithOutputsParams](#interface-ninjagettransactionwithoutputsparams), [NinjaGetTransactionsResultApi](#interface-ninjagettransactionsresultapi), [NinjaSignActionParams](#interface-ninjasignactionparams), [NinjaSignActionResultApi](#interface-ninjasignactionresultapi), [NinjaSubmitDirectTransactionParams](#interface-ninjasubmitdirecttransactionparams), [NinjaSubmitDirectTransactionResultApi](#interface-ninjasubmitdirecttransactionresultapi), [NinjaTransactionFailedHandler](#type-ninjatransactionfailedhandler), [NinjaTransactionProcessedHandler](#type-ninjatransactionprocessedhandler), [NinjaTransactionWithOutputsResultApi](#interface-ninjatransactionwithoutputsresultapi), [abortAction](#function-abortaction), [createActionSdk](#function-createactionsdk), [createTransactionWithOutputs](#function-createtransactionwithoutputs), [getTransactionWithOutputs](#function-gettransactionwithoutputs), [internalizeActionSdk](#function-internalizeactionsdk), [processPendingTransactions](#function-processpendingtransactions), [processTransactionWithOutputs](#function-processtransactionwithoutputs), [relinquishOutputSdk](#function-relinquishoutputsdk), [signAction](#function-signaction), [signActionSdk](#function-signactionsdk), [submitDirectTransaction](#function-submitdirecttransaction)

<details>

<summary>Interface NinjaApi Details</summary>

##### Property dojo

The dojo user wallet database supporting this api.

isAuthenticated must be true.

```ts
dojo: DojoClientApi
```

##### Method abortAction

Abort a transaction with status `unsigned` previously started by a call to `createAction`
with parameters meant to be completed by a call to `signAction`.

```ts
abortAction(params: NinjaAbortActionParams): Promise<NinjaAbortActionResultApi>
```
See also: [NinjaAbortActionParams](#interface-ninjaabortactionparams), [NinjaAbortActionResultApi](#interface-ninjaabortactionresultapi)

##### Method authenticate

Authenticates with configured dojo, if necessary.

```ts
authenticate(identityKey?: string, addIfNew?: boolean): Promise<void>
```

Argument Details

+ **identityKey**
  + Optional. The user's public identity key. Must be authorized to act on behalf of this user.
+ **addIfNew**
  + Optional. Create new user records if identityKey is unknown.

##### Method createAction

Create and process a new transaction with automatic funding.

Specific required inputs and new outputs can be specified.

An optional confirmation processing step can be provided prior to signing
and processing the new transaction. This is typically used to confirm total
spending.

```ts
createAction(params: NinjaCreateActionParams): Promise<NinjaCreateActionResult>
```
See also: [NinjaCreateActionParams](#interface-ninjacreateactionparams), [NinjaCreateActionResult](#interface-ninjacreateactionresult)

##### Method createTransaction

Creates a new transaction that must be processed with `processTransaction`
after you sign it

```ts
createTransaction(params: NinjaCreateTransactionParams): Promise<DojoCreateTransactionResultApi>
```
See also: [NinjaCreateTransactionParams](#interface-ninjacreatetransactionparams)

Returns

The template you need to sign and process

##### Method createTransactionWithOutputs

This method is equivalent to `getTransactionWithOutputs` with `params.autoProcess` false.
This function ignores `params.autoProcess`

Creates and signs a transaction with specified outputs.

It can be processed later with `processTransaction`.


This is a higher-level wrapper around `createTransaction` so that you do not need to manually handle signing,
when you are not providing any non-Dojo inputs.

Use this by default, and fall back to `createTransaction` if you need more customization.

```ts
createTransactionWithOutputs(params: NinjaGetTransactionWithOutputsParams): Promise<NinjaTransactionWithOutputsResultApi>
```
See also: [NinjaGetTransactionWithOutputsParams](#interface-ninjagettransactionwithoutputsparams), [NinjaTransactionWithOutputsResultApi](#interface-ninjatransactionwithoutputsresultapi)

##### Method deleteCertificate

Soft deletes a certificate.

```ts
deleteCertificate(partial: Partial<DojoCertificateApi>): Promise<number>
```

Argument Details

+ **partial**
  + The partial certificate data identifying the certificate to soft delete.

##### Method findCertificates

Use this endpoint to retrieve certificates.

```ts
findCertificates(certifiers?: string[] | object, types?: Record<string, string[]>): Promise<{
    status: "success";
    certificates: DojoCertificateApi[];
}>
```

Returns

A success object with `status: "success"` and any found certificates

Argument Details

+ **obj**
  + All parameters are given in an object

##### Method getAvatar

Returns the name and photo URL of the user

```ts
getAvatar(): Promise<DojoAvatarApi>
```

Returns

The avatar of the user

##### Method getChain

Returns which BSV network we are using (main or test)

```ts
getChain(): Promise<Chain>
```

##### Method getClientChangeKeyPair

Return the private / public keypair used by the Ninja client for change UTXOs

```ts
getClientChangeKeyPair(): KeyPairApi
```
See also: [KeyPairApi](#interface-keypairapi)

##### Method getEnvelopeForTransaction

Returns an Everett Style envelope for the given txid.

A transaction envelope is a tree of inputs where all the leaves are proven transactions.
The trivial case is a single leaf: the envelope for a proven transaction is the rawTx and its proof.

Each branching level of the tree corresponds to an unmined transaction without a proof,
in which case the envelope is:
- rawTx
- mapiResponses from transaction processors (optional)
- inputs object where keys are this transaction's input txids and values are recursive envelope for those txids.

```ts
getEnvelopeForTransaction(txid: string): Promise<EnvelopeApi | undefined>
```

Argument Details

+ **txid**
  + double hash of raw transaction as hex string

##### Method getEnvelopesOfConflictingTransactions

Returns array of Everett Style envelopes for transactions that spend one or
more of the inputs to transaction with `txid`, which must exist in Dojo.

This method supports double spend resolution.

```ts
getEnvelopesOfConflictingTransactions(txid: string): Promise<EnvelopeApi[]>
```

Argument Details

+ **txid**
  + double hash of raw transaction as hex string

##### Method getHeaderForHeight

```ts
getHeaderForHeight(height: number): Promise<number[] | undefined>
```

Returns

serialized block header for the given height or undefined, if height is invalid or unknown.

##### Method getHeight

Returns the current chain height of the network

```ts
getHeight(): Promise<number>
```

Returns

The current chain height

##### Method getInfo

```ts
getInfo(params: GetInfoParams): Promise<GetInfoResult>
```

Returns

information about the metanet-client context (version, chain, height, user...).

##### Method getMerkleRootForHeight

A method to verify the validity of a Merkle root for a given block height.

```ts
getMerkleRootForHeight(height: number): Promise<string | undefined>
```

Returns

merkle root for the given height or undefined, if height doesn't have a known merkle root or is invalid.

##### Method getNetOfAmounts

Returns the net sum of transaction amounts belonging to authenticated user,
incoming minus outgoing,
and optionally matching conditions in `options`.

```ts
getNetOfAmounts(options?: DojoGetTotalOfAmountsOptions): Promise<number>
```

##### Method getNetwork

Returns which BSV network we are using (mainnet or testnet)

```ts
getNetwork(format?: "default" | "nonet"): Promise<string>
```

Returns

The current BSV network formatted as requested.

Argument Details

+ **format**
  + for the returned string. Either with (default) or without (nonet) a 'net' suffix.

##### Method getPaymail

Returns the current Paymail handle

```ts
getPaymail(): Promise<string>
```

##### Method getPendingTransactions

Returns a set of all transactions that need to be signed and submitted, or canceled

```ts
getPendingTransactions(referenceNumber?: string): Promise<DojoPendingTxApi[]>
```

##### Method getSyncDojosByConfig

Gets the currently configured syncDojos and sync options.

If syncDojos are not being managed by `setSyncDojosByConfig` the returned configurations may include
a 'dojoType' of '<custom>'.

```ts
getSyncDojosByConfig(): Promise<{
    dojos: SyncDojoConfigBaseApi[];
    options?: DojoSyncOptionsApi;
}>
```

##### Method getTotalOfAmounts

Returns the sum of transaction amounts belonging to authenticated user,
matching the given direction (which must be specified),
and optionally matching remaining conditions in `options`.

```ts
getTotalOfAmounts(options: DojoGetTotalOfAmountsOptions): Promise<{
    total: number;
}>
```

##### Method getTotalValue

Returns the total of unspent outputs in satoshis. A non-negative integer.

```ts
getTotalValue(basket?: string): Promise<{
    total: number;
}>
```

Argument Details

+ **basket**
  + defaults to 'default' if undefined

##### Method getTransactionLabels

Returns transaction labels matching options and total matching count available.

```ts
getTransactionLabels(options?: DojoGetTransactionLabelsOptions): Promise<{
    labels: DojoTxLabelApi[];
    total: number;
}>
```

Argument Details

+ **options**
  + limit defaults to 25, offset defaults to 0, order defaults to 'descending'

##### Method getTransactionOutputs

Returns a set of transaction outputs that Dojo has tracked

```ts
getTransactionOutputs(options?: DojoGetTransactionOutputsOptions): Promise<NinjaGetTransactionOutputsResultApi[]>
```
See also: [NinjaGetTransactionOutputsResultApi](#interface-ninjagettransactionoutputsresultapi)

##### Method getTransactionWithOutputs

Creates and signs a transaction with specified outputs and (by default) processes it.

By setting `params.autoProcess` to false, it can be processed later with `processTransaction`.

If `params.autoProcess` is true (the default), `processTransaction` is called automatically
and merged results are returned.

This is a higher-level wrapper around `createTransaction` so that you do not need to manually handle signing,
when you are not providing any non-Dojo inputs.

Consider using either createTransactionWithOutputs or processTransactionWithOutputs
when `params.autoProcess` does not need to change at runtime.

Use this by default, and fall back to `createTransaction` if you need more customization.

```ts
getTransactionWithOutputs(params: NinjaGetTransactionWithOutputsParams): Promise<NinjaTransactionWithOutputsResultApi>
```
See also: [NinjaGetTransactionWithOutputsParams](#interface-ninjagettransactionwithoutputsparams), [NinjaTransactionWithOutputsResultApi](#interface-ninjatransactionwithoutputsresultapi)

##### Method getTransactions

Returns a set of transactions that match the criteria

```ts
getTransactions(options?: DojoGetTransactionsOptions): Promise<NinjaGetTransactionsResultApi>
```
See also: [NinjaGetTransactionsResultApi](#interface-ninjagettransactionsresultapi)

Argument Details

+ **options**
  + limit defaults to 25, offset defaults to 0, addLabels defaults to true, order defaults to 'descending'

##### Method isAuthenticated

```ts
isAuthenticated(): boolean
```

Returns

false until a call to `authenticate` succeeds

##### Method labelTransaction

Labels a transaction

Validates user is authenticated, txid matches an exsiting user transaction, and label value.

Creates new label if necessary.

Adds label to transaction if not already labeled.
Note: previously if transaction was already labeled, an error was thrown.

```ts
labelTransaction(txid: string | number | Partial<DojoTransactionApi>, label: string): Promise<void>
```

Argument Details

+ **txid**
  + unique transaction identifier, either transactionId, txid, or a partial pattern.
+ **label**
  + the label to be added, will be created if it doesn't already exist

##### Method processPendingTransactions

Signs and processes all pending transactions, useful when recovering from an
error or crash, or on startup. If a transaction fails to process, marks it
as failed.

```ts
processPendingTransactions(onTransactionProcessed?: NinjaTransactionProcessedHandler, onTransactionFailed?: NinjaTransactionFailedHandler): Promise<void>
```
See also: [NinjaTransactionFailedHandler](#type-ninjatransactionfailedhandler), [NinjaTransactionProcessedHandler](#type-ninjatransactionprocessedhandler)

##### Method processTransaction

After a transaction is created (with `createTransaction` or with `getTransactionWithOutputs`),
submit the serialized raw transaction to transaction processors for processing.

```ts
processTransaction(params: DojoProcessTransactionParams): Promise<DojoProcessTransactionResultApi>
```

Returns

`DojoProcessTransactionResultApi` with txid and status of 'completed' or 'unknown'

##### Method processTransactionWithOutputs

This method is equivalent to `getTransactionWithOutputs` with `params.autoProcess` true.
This function ignores `params.autoProcess`

Creates and signs a transaction with specified outputs and processes it.

This is a higher-level wrapper around `createTransaction` and `processTransaction`
so that you do not need to manually handle signing, when you are not providing any non-Dojo inputs.
Use this by default, and fall back to `createTransaction` if you need more customization.

```ts
processTransactionWithOutputs(params: NinjaGetTransactionWithOutputsParams): Promise<NinjaTransactionWithOutputsResultApi>
```
See also: [NinjaGetTransactionWithOutputsParams](#interface-ninjagettransactionwithoutputsparams), [NinjaTransactionWithOutputsResultApi](#interface-ninjatransactionwithoutputsresultapi)

##### Method saveCertificate

Use this endpoint to store an incoming certificate.

```ts
saveCertificate(certificate: DojoCertificateApi | object): Promise<void>
```

Returns

A success object with `status: "success"`

Argument Details

+ **obj**
  + All parameters are given in an object

##### Method setAvatar

Sets a new name and photo URL

```ts
setAvatar(name: string, photoURL: string): Promise<void>
```

Argument Details

+ **name**
  + A new name
+ **photoURL**
  + A new UHRP or HTTPS URL to a photo of the user

##### Method setPaymail

Changes the Paymail handle of the user.

NOTE that the old handle will be available for others to use.

NOTE that to prevent span, you may only do this if there is at least one unspent output under Dojo management.

```ts
setPaymail(paymail: string): Promise<void>
```

##### Method setSyncDojosByConfig

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

Argument Details

+ **syncDojoConfigs**
  + array of syncDojos to be used. May be empty.
+ **options**
  + place holder for future synchronization control options.

Throws

ERR_BAD_REQUEST if dojo's syncDojos are managed directly, e.g. `DojoExpressClient`

ERR_BAD_REQUEST if an attempt to set a `<custom>` sync dojo.

##### Method signAction

Complete a transaction with status `unsigned` previously started by a call to `createAction`
with parameters meant to be completed by a call to `signAction`.

```ts
signAction(params: NinjaSignActionParams): Promise<NinjaSignActionResultApi>
```
See also: [NinjaSignActionParams](#interface-ninjasignactionparams), [NinjaSignActionResultApi](#interface-ninjasignactionresultapi)

##### Method submitDirectTransaction

This endpoint allows a recipient to submit a transactions that was directly given to them by a sender.
Saves the inputs and key derivation information, allowing the UTXOs to be redeemed in the future.
Sets the transaction to completed and marks the outputs as spendable.

```ts
submitDirectTransaction(params: NinjaSubmitDirectTransactionParams): Promise<NinjaSubmitDirectTransactionResultApi>
```
See also: [NinjaSubmitDirectTransactionParams](#interface-ninjasubmitdirecttransactionparams), [NinjaSubmitDirectTransactionResultApi](#interface-ninjasubmitdirecttransactionresultapi)

##### Method sync

Sync's the dojo's state for the authenticated user with all of the configured syncDojos

This method should only be called when either a local or remote state change occurs, or may have occurred.

User state changes are propagated across all configured syncDojos.

```ts
sync(): Promise<void>
```

##### Method tagOutput

Tags an output

Validates user is authenticated, partial identifies a single output, and tag value.

Creates new tag if necessary.

Adds tag to output if not already tagged.

```ts
tagOutput(output: {
    txid: string;
    vout: number;
}, tag: string): Promise<void>
```

Argument Details

+ **partial**
  + unique output identifier as a partial pattern.
+ **tag**
  + the tag to add, will be created if it doesn't already exist

##### Method unbasketOutput

Removes the uniquely identified output's basket assignment.

The output will no longer belong to any basket.

This is typically only useful for outputs that are no longer usefull.

```ts
unbasketOutput(output: {
    txid: string;
    vout: number;
}): Promise<void>
```

##### Method unlabelTransaction

Removes a label from a transaction

Validates user is authenticated, txid matches an exsiting user transaction, and label already exits.

Does nothing if transaction is not labeled.

```ts
unlabelTransaction(txid: string | number | Partial<DojoTransactionApi>, label: string): Promise<void>
```

Argument Details

+ **txid**
  + unique transaction identifier, either transactionId, txid, or a partial pattern.
+ **label**
  + the label to be removed

##### Method untagOutput

Removes a tag from an output

Validates user is authenticated, partial identifies a single output, and tag already exits.

Does nothing if output is not tagged.

```ts
untagOutput(output: {
    txid: string;
    vout: number;
}, tag: string): Promise<void>
```

Argument Details

+ **partial**
  + unique output identifier as a partial pattern.
+ **tag**
  + the tag to be removed from the output

##### Method updateOutpointStatus

Use this endpoint to update the status of one of your outputs, given as the TXID of a transaction and the vout (output index) in that transaction. This is useful for flagging transaction outpoints as spent if they were inadvertantly broadcasted or used without properly submitting them to the Dojo, or to undo the spending of an output if it was never actually spent.

```ts
updateOutpointStatus(params: {
    txid: string;
    vout: number;
    spendable: boolean;
}): Promise<void>
```

Argument Details

+ **params.txid**
  + The TXID of the transaction that created the output
+ **params.vout**
  + The index of the output in the transaction
+ **params.spendable**
  + The true spendability status of this outpoint

##### Method updateTransactionStatus

Use this endpoint to update the status of a transaction. This is useful for flagging incomplete transactions as aborted
or reverting a completed transaction back into a pending status if it never got confirmed. Setting the status to "completed"
or "unproven" will make any input UTXOs unavailable for spending,
while any other status value will free up the UTXOs for use in other transactions.

```ts
updateTransactionStatus(params: {
    reference: string;
    status: DojoTransactionStatusApi;
}): Promise<void>
```

Argument Details

+ **params.reference**
  + The Dojo reference number for the transaction
+ **params.status**
  + The new status of the transaction

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: NinjaCompleteCreateTransactionWithOutputsParams

```ts
export interface NinjaCompleteCreateTransactionWithOutputsParams {
    inputs?: Record<string, NinjaTxInputsApi>;
    note?: string;
    createResult: DojoCreateTransactionResultApi;
}
```

See also: [NinjaTxInputsApi](#interface-ninjatxinputsapi)

<details>

<summary>Interface NinjaCompleteCreateTransactionWithOutputsParams Details</summary>

##### Property inputs

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
See also: [NinjaTxInputsApi](#interface-ninjatxinputsapi)

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: NinjaCreateActionConfirmResult

```ts
export interface NinjaCreateActionConfirmResult {
    proceedToSign: boolean;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: NinjaCreateActionParams

```ts
export interface NinjaCreateActionParams {
    params: CreateActionParams;
    confirmCreateTransactionResult?: (result: NinjaTransactionWithOutputsResultApi) => Promise<NinjaCreateActionConfirmResult>;
}
```

See also: [NinjaCreateActionConfirmResult](#interface-ninjacreateactionconfirmresult), [NinjaTransactionWithOutputsResultApi](#interface-ninjatransactionwithoutputsresultapi)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: NinjaCreateActionResult

```ts
export interface NinjaCreateActionResult {
    proceedToSign: boolean;
    result?: CreateActionResult;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: NinjaCreateTransactionParams

Input parameters to createTransaction method.

```ts
export interface NinjaCreateTransactionParams {
    inputs: Record<string, DojoTxInputsApi>;
    inputSelection?: DojoTxInputSelectionApi;
    outputs: DojoCreateTxOutputApi[];
    outputGeneration?: DojoOutputGenerationApi;
    fee?: DojoFeeModelApi;
    labels: string[];
    note?: string;
    recipient?: string;
}
```

<details>

<summary>Interface NinjaCreateTransactionParams Details</summary>

##### Property fee

When the fee model is "sat/kb", this is the number of satoshis per kilobyte of block space
that the transaction will pay.

```ts
fee?: DojoFeeModelApi
```

##### Property inputSelection

If Dojo needs to select more inputs beyond what you provided in the `inputs` parameter,
this parameter describes which kinds of inputs can be selected, and from where.

```ts
inputSelection?: DojoTxInputSelectionApi
```

##### Property inputs

Specify any additional inputs to the transaction (if any) that are not to be provided by the Dojo.
If you do not provide inputs here, or if they are insufficient,
Dojo will select additional inputs for you to sign.
To control this input selection behavior, see the `inputSelection` parameter.
This `inputs` parameter is an object whose keys are TXIDs of input transactions,
and whose values are their associated SPV envelopes.

```ts
inputs: Record<string, DojoTxInputsApi>
```

##### Property labels

The labels to affix to this transaction

```ts
labels: string[]
```

##### Property note

A numan-readable note describing the transaction

```ts
note?: string
```

##### Property outputGeneration

If Dojo needs to generate additional outputs for the transaction beyond what was specified,
this object describes what kind of outputs to generate, and where they should be kept.

The method used to generate outputs.
"auto" selects the amount and types of generated outputs based on the selected basket's
configuration for how many of each type to keep on hand,
then uses Benford's law to distribute the satoshis across them.
"single" just uses one output, randomly selected from the available types,
that contains all the satoshis.

```ts
outputGeneration?: DojoOutputGenerationApi
```

##### Property outputs

External outputs that you will include when you create this transaction.
These outputs can contain custom scripts as specified by recipients.
If the inputs to the transaction go beyond what is needed to fund
these outputs (plus the transaction fee),
additional Dojo-managed UTXOs will be generated to collect
the remainder (see the `outputGeneration` parameter for more on this).

```ts
outputs: DojoCreateTxOutputApi[]
```

##### Property recipient

The Paymail handle for the recipient of the transaction

```ts
recipient?: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: NinjaGetPendingTransactionsInputApi

```ts
export interface NinjaGetPendingTransactionsInputApi extends EnvelopeEvidenceApi {
    outputsToRedeem: number[];
    instructions: Record<number, NinjaGetPendingTransactionsInstructionsApi>;
}
```

See also: [NinjaGetPendingTransactionsInstructionsApi](#interface-ninjagetpendingtransactionsinstructionsapi)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

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

##### Property customInstructions

max length of 2500

```ts
customInstructions: string | null
```

##### Property derivationPrefix

max length of 32
base64 encoded

```ts
derivationPrefix: string | null
```

##### Property derivationSuffix

max length of 32
base64 encoded

```ts
derivationSuffix: string | null
```

##### Property paymailHandle

max length of 64

```ts
paymailHandle: string | null
```

##### Property senderIdentityKey

max length of 130
hex encoded

```ts
senderIdentityKey: string | null
```

##### Property type

max length of 50
e.g. P2PKH, custom

```ts
type: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: NinjaGetPendingTransactionsTxApi

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

See also: [NinjaGetPendingTransactionsInputApi](#interface-ninjagetpendingtransactionsinputapi)

<details>

<summary>Interface NinjaGetPendingTransactionsTxApi Details</summary>

##### Property amount

The number of satoshis added or removed from Dojo by this transaction

```ts
amount: number
```

##### Property created_at

The time the transaction was registered with the Dojo

```ts
created_at: string
```

##### Property inputs

parsed truncatedExternalInputs

```ts
inputs?: Record<string, NinjaGetPendingTransactionsInputApi>
```
See also: [NinjaGetPendingTransactionsInputApi](#interface-ninjagetpendingtransactionsinputapi)

##### Property provenTxId

Is valid when transaction proof record exists in DojoProvenTxApi table.

```ts
provenTxId?: number | null
```

##### Property referenceNumber

The Dojo reference number for the transaction

```ts
referenceNumber: string
```

##### Property senderPaymail

The Paymail handle of the person who sent the transaction

```ts
senderPaymail: string | undefined | null
```

##### Property status

max length of 64
e.g. unprocessed, unsigned

```ts
status: DojoTransactionStatusApi
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: NinjaGetTransactionOutputsResultApi

```ts
export interface NinjaGetTransactionOutputsResultApi extends GetTransactionOutputResult {
    txid: string;
    vout: number;
    amount: number;
    outputScript: string;
    type: string;
    spendable: boolean;
    envelope?: EnvelopeApi;
    customInstructions?: string;
    basket?: string;
    tags?: string[];
}
```

<details>

<summary>Interface NinjaGetTransactionOutputsResultApi Details</summary>

##### Property amount

Number of satoshis in the output

```ts
amount: number
```

##### Property basket

If `includeBasket` option is true, name of basket to which this output belongs.

```ts
basket?: string
```

##### Property customInstructions

When envelope requested, any custom instructions associated with this output.

```ts
customInstructions?: string
```

##### Property envelope

When requested and available, output validity support envelope.

```ts
envelope?: EnvelopeApi
```

##### Property outputScript

Hex representation of output locking script

```ts
outputScript: string
```

##### Property spendable

Whether this output is free to be spent

```ts
spendable: boolean
```

##### Property tags

If `includeTags` option is true, tags assigned to this output.

```ts
tags?: string[]
```

##### Property txid

Transaction ID of transaction that created the output

```ts
txid: string
```

##### Property type

The type of output, for example "P2PKH" or "P2RPH"

```ts
type: string
```

##### Property vout

Index in the transaction of the output

```ts
vout: number
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: NinjaGetTransactionWithOutputsParams

Input parameters to getTransactionWithOutputs method.

```ts
export interface NinjaGetTransactionWithOutputsParams {
    outputs?: DojoCreateTxOutputApi[];
    labels?: string[];
    inputs?: Record<string, NinjaTxInputsApi>;
    beef?: Beef | number[];
    note?: string;
    lockTime?: number;
    version?: number;
    recipient?: string;
    autoProcess?: boolean;
    feePerKb?: number;
    feeModel?: DojoFeeModelApi;
    options?: CreateActionOptions;
    acceptDelayedBroadcast?: boolean;
    log?: string;
}
```

See also: [NinjaTxInputsApi](#interface-ninjatxinputsapi)

<details>

<summary>Interface NinjaGetTransactionWithOutputsParams Details</summary>

##### Property acceptDelayedBroadcast

DEPRECATED: Use `options.acceptDelayedBroadcast`

Set to true for normal, high performance operation and offline
operation if running locally.

Always validates `submittedTransaction` and remaining inputs.

If true, creates a self-signed MapiResponse for the transaction
and queues it for repeated broadcast attempts and proof validation.
The `status` of the transaction will be set to `unproven`.

If not true, attempts one broadcast and fails the transaction
if it is not accepted by at least one external transaction processor.
If it is accepted, status is set to `unproven'.
The transaction may still fail at a later time if a merkle
proof is not confirmed.

The transaction status will be set to `completed` or `failed`
depending on the success or failure of broadcast attempts
and Chaintracks validation of a merkle proof.

When status is set to `unproven` or `completed`:
- Inputs are confirmed to be spendable false, spentBy this transaction.
- Outputs are set to spendable true unless already spent (spentBy is non-null).

If the transaction fails, status is set to `failed`:
- Inputs are returned to spendable true, spentBy null
- Outputs are set to spendable false
- If spentBy is non-null, failure propagates to that transaction.

```ts
acceptDelayedBroadcast?: boolean
```

##### Property autoProcess

Whether the transaction should be processed automatically
with processTransaction. Note that this will return `mapiResponses` and `note`
instead of referenceNumber

default true

```ts
autoProcess?: boolean
```

##### Property beef

Optional. Alternate source of validity proof data for `inputs`.
If `number[]` it must be serialized `Beef`.

```ts
beef?: Beef | number[]
```

##### Property feeModel

Optional. The fee model used by this transaction.

If both feeModel and feePerKb are specified, feeModel takes precendence

```ts
feeModel?: DojoFeeModelApi
```

##### Property feePerKb

Optional. The number of satoshis to pay per KB of block space used by this transaction.

If both feeModel and feePerKb are specified, feeModel takes precendence

```ts
feePerKb?: number
```

##### Property inputs

Input scripts to spend as part of this transaction.

This is an object whose keys are TXIDs and whose values are, optionally, Everett-style
transaction envelopes.

The values must contain a field called `outputsToRedeem`.
This is an array of objects, each containing `index` and `unlockingScript` properties.

The `index` property is the output number in the transaction you are spending,
and `unlockingScript` is the hex scriptcode that unlocks the satoshis or the maximum script length for signActionRequired.

If hex scriptcode is provided, create any signatures with `SIGHASH_NONE | ANYONECANPAY` or similar
so that the additional Dojo outputs can be added afterward without invalidating your signature.

```ts
inputs?: Record<string, NinjaTxInputsApi>
```
See also: [NinjaTxInputsApi](#interface-ninjatxinputsapi)

##### Property labels

A set of label strings to affix to the transaction

```ts
labels?: string[]
```

##### Property lockTime

Optional. Default is zero.
When the transaction can be processed into a block:
>= 500,000,000 values are interpreted as minimum required unix time stamps in seconds
< 500,000,000 values are interpreted as minimum required block height

```ts
lockTime?: number
```

##### Property log

Optional transaction processing log

```ts
log?: string
```

##### Property note

A note about the transaction

```ts
note?: string
```

##### Property options

Processing options.

```ts
options?: CreateActionOptions
```

##### Property outputs

A set of outputs to include, each with `script` and `satoshis`.

```ts
outputs?: DojoCreateTxOutputApi[]
```

##### Property recipient

Paymail recipient for transaction

```ts
recipient?: string
```

##### Property version

Optional. Transaction version number, default is current standard transaction version value.

```ts
version?: number
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: NinjaGetTransactionsResultApi

```ts
export interface NinjaGetTransactionsResultApi {
    totalTransactions: number;
    transactions: NinjaGetTransactionsTxApi[];
}
```

See also: [NinjaGetTransactionsTxApi](#interface-ninjagettransactionstxapi)

<details>

<summary>Interface NinjaGetTransactionsResultApi Details</summary>

##### Property totalTransactions

The number of transactions in the complete set

```ts
totalTransactions: number
```

##### Property transactions

The specific transactions from the set that were requested, based on `limit` and `offset`

```ts
transactions: NinjaGetTransactionsTxApi[]
```
See also: [NinjaGetTransactionsTxApi](#interface-ninjagettransactionstxapi)

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: NinjaGetTransactionsTxApi

```ts
export interface NinjaGetTransactionsTxApi extends ListActionsTransaction {
    txid: string;
    amount: number;
    status: TransactionStatusApi;
    senderPaymail: string;
    recipientPaymail: string;
    isOutgoing: boolean;
    note: string;
    created_at: string;
    referenceNumber: string;
    labels: string[];
    inputs?: NinjaGetTransactionsTxInputApi[];
    outputs?: NinjaGetTransactionsTxOutputApi[];
}
```

See also: [NinjaGetTransactionsTxInputApi](#interface-ninjagettransactionstxinputapi), [NinjaGetTransactionsTxOutputApi](#interface-ninjagettransactionstxoutputapi)

<details>

<summary>Interface NinjaGetTransactionsTxApi Details</summary>

##### Property amount

The number of satoshis added or removed from Dojo by this transaction

```ts
amount: number
```

##### Property created_at

The time the transaction was registered with the Dojo

```ts
created_at: string
```

##### Property isOutgoing

Whether or not the transaction was created with `createTransaction`

```ts
isOutgoing: boolean
```

##### Property labels

A set of all the labels affixed to the transaction

```ts
labels: string[]
```

##### Property note

The human-readable tag for the transaction, provided by the person who initiated it

```ts
note: string
```

##### Property recipientPaymail

The Paymail handle of the person who received the transaction

```ts
recipientPaymail: string
```

##### Property referenceNumber

The Dojo reference number for the transaction

```ts
referenceNumber: string
```

##### Property senderPaymail

The Paymail handle of the person who sent the transaction

```ts
senderPaymail: string
```

##### Property status

The current state of the transaction. Common statuses are `completed` and `unproven`.

```ts
status: TransactionStatusApi
```

##### Property txid

The transaction ID

```ts
txid: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: NinjaGetTransactionsTxInputApi

```ts
export interface NinjaGetTransactionsTxInputApi extends ListActionsTransactionInput {
    txid: string;
    vout: number;
    amount: number;
    outputScript: string;
    type: string;
    spendable: boolean;
    spendingDescription?: string;
    basket?: string;
    tags?: string[];
}
```

<details>

<summary>Interface NinjaGetTransactionsTxInputApi Details</summary>

##### Property amount

Number of satoshis in the output

```ts
amount: number
```

##### Property basket

Optionally included basket assignment.

```ts
basket?: string
```

##### Property outputScript

Hex representation of output locking script

```ts
outputScript: string
```

##### Property spendable

Whether this output is free to be spent

```ts
spendable: boolean
```

##### Property spendingDescription

Spending description for this transaction input

```ts
spendingDescription?: string
```

##### Property tags

Optionally included tag assignments.

```ts
tags?: string[]
```

##### Property txid

Transaction ID of transaction that created the output

```ts
txid: string
```

##### Property type

The type of output, for example "P2PKH" or "P2RPH"

```ts
type: string
```

##### Property vout

Index in the transaction of the output

```ts
vout: number
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: NinjaGetTransactionsTxOutputApi

```ts
export interface NinjaGetTransactionsTxOutputApi extends ListActionsTransactionOutput {
    txid: string;
    vout: number;
    amount: number;
    outputScript: string;
    type: string;
    spendable: boolean;
    description?: string;
    basket?: string;
    tags?: string[];
}
```

<details>

<summary>Interface NinjaGetTransactionsTxOutputApi Details</summary>

##### Property amount

Number of satoshis in the output

```ts
amount: number
```

##### Property basket

Optionally included basket assignment.

```ts
basket?: string
```

##### Property description

Output description

```ts
description?: string
```

##### Property outputScript

Hex representation of output locking script

```ts
outputScript: string
```

##### Property spendable

Whether this output is free to be spent

```ts
spendable: boolean
```

##### Property tags

Optionally included tag assignments.

```ts
tags?: string[]
```

##### Property txid

Transaction ID of transaction that created the output

```ts
txid: string
```

##### Property type

The type of output, for example "P2PKH" or "P2RPH"

```ts
type: string
```

##### Property vout

Index in the transaction of the output

```ts
vout: number
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: NinjaOutputToRedeemApi

```ts
export interface NinjaOutputToRedeemApi {
    index: number;
    unlockingScript: string | number;
    spendingDescription?: string;
    sequenceNumber?: number;
}
```

<details>

<summary>Interface NinjaOutputToRedeemApi Details</summary>

##### Property index

Zero based output index within its transaction to spend.

```ts
index: number
```

##### Property sequenceNumber

Sequence number to use when spending

```ts
sequenceNumber?: number
```

##### Property unlockingScript

Hex scriptcode that unlocks the satoshis or the maximum script length (in bytes) if using `signAction`.

When supplying a signed unlock script, it should use `SIGHASH_NONE | ANYONECANPAY` (or similar)
so additional Dojo outputs can added if necessary without invalidating the signature.

```ts
unlockingScript: string | number
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: NinjaSignActionParams

```ts
export interface NinjaSignActionParams extends NinjaSignCreatedTransactionParams {
    inputs: Record<string, NinjaTxInputsApi>;
    createResult: DojoCreateTransactionResultApi;
    acceptDelayedBroadcast?: boolean;
}
```

See also: [NinjaSignCreatedTransactionParams](#interface-ninjasigncreatedtransactionparams), [NinjaTxInputsApi](#interface-ninjatxinputsapi)

<details>

<summary>Interface NinjaSignActionParams Details</summary>

##### Property acceptDelayedBroadcast

Must match original value passed to `createAction`.

```ts
acceptDelayedBroadcast?: boolean
```

##### Property createResult

The dojo createTransaction results returned from createAction.

```ts
createResult: DojoCreateTransactionResultApi
```

##### Property inputs

Input scripts to spend as part of this transaction.

This is an object whose keys are TXIDs and whose values are Everett-style
transaction envelopes that contain an additional field called `outputsToRedeem`.

This is an array of objects, each containing `index` and `unlockingScript` properties.

The `index` property is the output number in the transaction you are spending,
and `unlockingScript` is the hex scriptcode that unlocks the satoshis.

Note that you should create any signatures with `SIGHASH_NONE | ANYONECANPAY` or similar
so that the additional Dojo outputs can be added afterward without invalidating your signature.

```ts
inputs: Record<string, NinjaTxInputsApi>
```
See also: [NinjaTxInputsApi](#interface-ninjatxinputsapi)

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: NinjaSignActionResultApi

```ts
export interface NinjaSignActionResultApi extends NinjaTransactionWithOutputsResultApi {
    rawTx?: string;
    txid?: string;
    amount: number;
    inputs: Record<string, OptionalEnvelopeEvidenceApi>;
    note?: string;
    referenceNumber: string;
    outputMap?: Record<string, number>;
    mapiResponses?: MapiResponseApi[];
    log?: string;
}
```

See also: [NinjaTransactionWithOutputsResultApi](#interface-ninjatransactionwithoutputsresultapi)

<details>

<summary>Interface NinjaSignActionResultApi Details</summary>

##### Property amount

The amount of the transaction

```ts
amount: number
```

##### Property inputs

This is the fully-formed `inputs` field of this transaction, as per the SPV Envelope specification.

```ts
inputs: Record<string, OptionalEnvelopeEvidenceApi>
```

##### Property log

Optional transaction processing history

```ts
log?: string
```

##### Property mapiResponses

If processed, array of acceptance responses from mapi transaction processors.

Only valid if signActionRequired !== true

```ts
mapiResponses?: MapiResponseApi[]
```

##### Property outputMap

Map of change output derivationSuffix values to transaction vout indices

Only valid if signActionRequired !== true

```ts
outputMap?: Record<string, number>
```

##### Property rawTx

The serialized, signed transaction that is ready for broadcast, or has been broadcast.

Only valid if signActionRequired !== true

```ts
rawTx?: string
```

##### Property referenceNumber

The reference number that should now be provided back to `processTransaction (or `updateTransactionStatus`)

```ts
referenceNumber: string
```

##### Property txid

rawTx hash as hex string

Only valid if signActionRequired !== true

```ts
txid?: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: NinjaSignCreatedTransactionParams

```ts
export interface NinjaSignCreatedTransactionParams {
    inputs: Record<string, NinjaTxInputsApi>;
    createResult: DojoCreateTransactionResultApi;
}
```

See also: [NinjaTxInputsApi](#interface-ninjatxinputsapi)

<details>

<summary>Interface NinjaSignCreatedTransactionParams Details</summary>

##### Property inputs

Input scripts to spend as part of this transaction.

This is an object whose keys are TXIDs and whose values are Everett-style
transaction envelopes that contain an additional field called `outputsToRedeem`.

This is an array of objects, each containing `index` and `unlockingScript` properties.

The `index` property is the output number in the transaction you are spending,
and `unlockingScript` is the hex scriptcode that unlocks the satoshis.

Note that you should create any signatures with `SIGHASH_NONE | ANYONECANPAY` or similar
so that the additional Dojo outputs can be added afterward without invalidating your signature.

```ts
inputs: Record<string, NinjaTxInputsApi>
```
See also: [NinjaTxInputsApi](#interface-ninjatxinputsapi)

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: NinjaSubmitDirectTransactionApi

Transaction input parameter to submitDirectTransaction method.

```ts
export interface NinjaSubmitDirectTransactionApi extends SubmitDirectTransaction {
    rawTx: string;
    txid?: string;
    inputs?: Record<string, OptionalEnvelopeEvidenceApi>;
    mapiResponses?: MapiResponseApi[];
    proof?: TscMerkleProofApi;
    outputs: NinjaSubmitDirectTransactionOutputApi[];
    referenceNumber?: string;
}
```

See also: [NinjaSubmitDirectTransactionOutputApi](#interface-ninjasubmitdirecttransactionoutputapi)

<details>

<summary>Interface NinjaSubmitDirectTransactionApi Details</summary>

##### Property outputs

sparse array of outputs of interest where indices match vout numbers.

```ts
outputs: NinjaSubmitDirectTransactionOutputApi[]
```
See also: [NinjaSubmitDirectTransactionOutputApi](#interface-ninjasubmitdirecttransactionoutputapi)

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: NinjaSubmitDirectTransactionOutputApi

```ts
export interface NinjaSubmitDirectTransactionOutputApi extends SubmitDirectTransactionOutput {
    vout: number;
    satoshis: number;
    basket?: string;
    derivationPrefix?: string;
    derivationSuffix?: string;
    customInstructions?: string;
    senderIdentityKey?: string;
    tags?: string[];
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: NinjaSubmitDirectTransactionParams

Input parameters to submitDirectTransaction method.

```ts
export interface NinjaSubmitDirectTransactionParams {
    protocol?: string;
    transaction: NinjaSubmitDirectTransactionApi;
    senderIdentityKey: string;
    note: string;
    labels?: string[];
    derivationPrefix?: string;
    amount?: number;
}
```

See also: [NinjaSubmitDirectTransactionApi](#interface-ninjasubmitdirecttransactionapi)

<details>

<summary>Interface NinjaSubmitDirectTransactionParams Details</summary>

##### Property derivationPrefix

A derivation prefix used for all outputs. If provided, derivation prefixes on all outputs are optional.

```ts
derivationPrefix?: string
```

##### Property labels

Labels to assign to transaction.

```ts
labels?: string[]
```

##### Property note

Human-readable description for the transaction

```ts
note: string
```

##### Property protocol

Specify the transaction submission payment protocol to use.
Currently, the only supported protocol is that with BRFC ID "3241645161d8"

```ts
protocol?: string
```

##### Property senderIdentityKey

Provide the identity key for the person who sent the transaction

```ts
senderIdentityKey: string
```

##### Property transaction

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
See also: [NinjaSubmitDirectTransactionApi](#interface-ninjasubmitdirecttransactionapi)

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: NinjaSubmitDirectTransactionResultApi

```ts
export interface NinjaSubmitDirectTransactionResultApi extends SubmitDirectTransactionResult {
    transactionId: number;
    referenceNumber: string;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

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

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

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

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: NinjaTransactionWithOutputsResultApi

```ts
export interface NinjaTransactionWithOutputsResultApi {
    signActionRequired?: boolean;
    createResult?: DojoCreateTransactionResultApi;
    beef?: number[];
    noSendChange?: OutPoint[];
    rawTx?: string;
    txid?: string;
    amount: number;
    inputs: Record<string, OptionalEnvelopeEvidenceApi>;
    note?: string;
    referenceNumber: string;
    outputMap?: Record<string, number>;
    mapiResponses?: MapiResponseApi[];
    options: CreateActionOptions;
    log?: string;
}
```

<details>

<summary>Interface NinjaTransactionWithOutputsResultApi Details</summary>

##### Property amount

The amount of the transaction

```ts
amount: number
```

##### Property beef

valid if `options.resultFormat` is 'beef'

When valid, rawTx and inputs will be undefined and `{}` respectively.

may contain known txid's using the extended beef format if `options.knownTxids` is used.

```ts
beef?: number[]
```

##### Property createResult

if signActionRequired, the dojo createTransaction results to be forwarded to signAction

```ts
createResult?: DojoCreateTransactionResultApi
```

##### Property inputs

This is the fully-formed `inputs` field of this transaction, as per the SPV Envelope specification.

```ts
inputs: Record<string, OptionalEnvelopeEvidenceApi>
```

##### Property log

Optional transaction processing history

```ts
log?: string
```

##### Property mapiResponses

If processed, array of acceptance responses from mapi transaction processors.

Only valid if signActionRequired !== true

```ts
mapiResponses?: MapiResponseApi[]
```

##### Property noSendChange

Valid for options.noSend true.

Change output(s) that may be forwarded to chained noSend transactions.

```ts
noSendChange?: OutPoint[]
```

##### Property options

Processing options.

```ts
options: CreateActionOptions
```

##### Property outputMap

Map of change output derivationSuffix values to transaction vout indices

Only valid if signActionRequired !== true

```ts
outputMap?: Record<string, number>
```

##### Property rawTx

The serialized, signed transaction that is ready for broadcast, or has been broadcast.

Only valid if signActionRequired !== true and `options.trustSelf` is undefined

```ts
rawTx?: string
```

##### Property referenceNumber

The reference number that should now be provided back to `processTransaction (or `updateTransactionStatus`)

```ts
referenceNumber: string
```

##### Property signActionRequired

true if at least one input's outputsToRedeem uses numeric max script byte length for unlockingScript

If true, in-process transaction will have status `unsigned`. An `unsigned` transaction must be completed
by signing all remaining unsigned inputs and calling `signAction`. Failure to complete the process in
a timely manner will cause the transaction to transition to `failed`.

If false or undefined, completed transaction will have status of `sending` or `unproven`,
depending on `acceptDelayedBroadcast` being true or false.

```ts
signActionRequired?: boolean
```

##### Property txid

rawTx hash as hex string

Only valid if signActionRequired !== true

```ts
txid?: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: NinjaTxInputsApi

```ts
export interface NinjaTxInputsApi extends OptionalEnvelopeEvidenceApi {
    outputsToRedeem: NinjaOutputToRedeemApi[];
}
```

See also: [NinjaOutputToRedeemApi](#interface-ninjaoutputtoredeemapi)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

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

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: PendingDojoInput

```ts
export interface PendingDojoInput {
    vin: number;
    derivationPrefix: string;
    derivationSuffix: string;
    unlockerPubKey?: string;
    sourceSatoshis: number;
    lockingScript: string;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: PendingSignAction

```ts
export interface PendingSignAction {
    reference: string;
    dcr: DojoCreateTransactionSdkResult;
    args: sdk.ValidCreateActionArgs;
    tx: Transaction;
    amount: number;
    pdi: PendingDojoInput[];
}
```

See also: [PendingDojoInput](#interface-pendingdojoinput)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

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

See also: [ProcessIncomingTransactionInputApi](#interface-processincomingtransactioninputapi), [ProcessIncomingTransactionOutputApi](#interface-processincomingtransactionoutputapi)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ProcessIncomingTransactionInputApi

```ts
export interface ProcessIncomingTransactionInputApi {
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

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

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

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

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: SignActionParams

```ts
export interface SignActionParams {
    inputs: Record<string, NinjaTxInputsApi>;
    createResult?: NinjaTransactionWithOutputsResultApi;
    originator?: string;
    acceptDelayedBroadcast?: boolean;
    log?: string;
}
```

See also: [NinjaTransactionWithOutputsResultApi](#interface-ninjatransactionwithoutputsresultapi), [NinjaTxInputsApi](#interface-ninjatxinputsapi)

<details>

<summary>Interface SignActionParams Details</summary>

##### Property acceptDelayedBroadcast

true if local validation and self-signed mapi response is sufficient.
Upon return, transaction will have `sending` status. Watchman will proceed to send the transaction asynchronously.

false if a valid mapi response from the bitcoin transaction processing network is required.
Upon return, transaction will have `unproven` status. Watchman will proceed to prove transaction.

Must match CreateActionParams value.

default true

```ts
acceptDelayedBroadcast?: boolean
```

##### Property createResult

the dojo createTransaction results returned from createAction to be forwarded to signAction

```ts
createResult?: NinjaTransactionWithOutputsResultApi
```
See also: [NinjaTransactionWithOutputsResultApi](#interface-ninjatransactionwithoutputsresultapi)

##### Property inputs

each input's outputsToRedeem:
  - satoshis must be greater than zero, must match output's value.
  - spendingDescription length limit is 50, values are encrypted before leaving this device
  - unlockingScript must all be hex string.

Must match CreateActionParams with the exception of fully resolved unlockingScript values.

```ts
inputs: Record<string, NinjaTxInputsApi>
```
See also: [NinjaTxInputsApi](#interface-ninjatxinputsapi)

##### Property log

Optional operational and performance logging prior data.

```ts
log?: string
```

##### Property originator

Reserved Admin originators
  'projectbabbage.com'
  'staging-satoshiframe.babbage.systems'
  'satoshiframe.babbage.systems'

```ts
originator?: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: TxOutputApi

```ts
export interface TxOutputApi {
    satoshis: number;
    script: string;
}
```

<details>

<summary>Interface TxOutputApi Details</summary>

##### Property satoshis

The amount of satoshis that will be in the output

```ts
satoshis: number
```

##### Property script

The hex string representing the output locking script

```ts
script: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: TxRedeemableOutputApi

```ts
export interface TxRedeemableOutputApi {
    index: number;
    unlockingScriptLength: number;
}
```

<details>

<summary>Interface TxRedeemableOutputApi Details</summary>

##### Property index

The index of the output to redeem in the transaction

```ts
index: number
```

##### Property unlockingScriptLength

The byte length of the unlocking script you intend to use to unlock this output

```ts
unlockingScriptLength: number
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Classes

| |
| --- |
| [DojoExpressClient](#class-dojoexpressclient) |
| [ERR_NINJA_INVALID_UNLOCK](#class-err_ninja_invalid_unlock) |
| [ERR_NINJA_MISSING_UNLOCK](#class-err_ninja_missing_unlock) |
| [Ninja](#class-ninja) |
| [NinjaBase](#class-ninjabase) |
| [NinjaV2](#class-ninjav2) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Class: DojoExpressClient

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
    isDojoExpressClient(): boolean 
    async destroy(): Promise<void> 
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
    async getTransactions(options?: DojoGetTransactionsOptions): Promise<DojoGetTransactionsResultApi> 
    async getPendingTransactions(referenceNumber?: string): Promise<DojoPendingTxApi[]> 
    async getBeefForTransaction(txid: string, options?: DojoGetBeefOptions): Promise<Beef> 
    async getEnvelopeForTransaction(txid: string): Promise<EnvelopeApi | undefined> 
    async getEnvelopesOfConflictingTransactions(txid: string): Promise<EnvelopeApi[]> 
    async getTransactionOutputs(options?: DojoGetTransactionOutputsOptions): Promise<DojoGetTransactionOutputsResultApi> 
    async getTransactionLabels(options?: DojoGetTransactionLabelsOptions): Promise<DojoGetTransactionLabelsResultApi> 
    async currentHeight(): Promise<number> 
    async isValidRootForHeight(root: string, height: number): Promise<boolean> 
    async listActions(args: sdk.ValidListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListActionsResult> 
    async listOutputs(args: sdk.ValidListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListOutputsResult> 
    async internalizeActionSdk(args: DojoInternalizeActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.InternalizeActionResult> 
    async createTransactionSdk(args: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<DojoCreateTransactionSdkResult> 
    async processActionSdk(params: DojoProcessActionSdkParams, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<DojoProcessActionSdkResults> 
    async abortActionSdk(vargs: sdk.ValidAbortActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.AbortActionResult> 
    async relinquishOutputSdk(vargs: sdk.ValidRelinquishOutputArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.RelinquishOutputResult> 
    async createTransaction(params: DojoCreateTransactionParams): Promise<DojoCreateTransactionResultApi> 
    async processTransaction(params: DojoProcessTransactionParams): Promise<DojoProcessTransactionResultApi> 
    async submitDirectTransaction(params: DojoSubmitDirectTransactionParams): Promise<DojoSubmitDirectTransactionResultApi> 
    async copyState(): Promise<DojoUserStateApi> 
    async getJsonOrUndefined<T>(path: string): Promise<T | undefined> 
    async getJson<T>(path: string): Promise<T> 
    handleError<T>(s: FetchStatus<T>, path: string): void 
    async postJsonOrUndefined<T, R>(path: string, params: T, noAuth?: boolean): Promise<R | undefined> 
    async postJson<T, R>(path: string, params: T, noAuth?: boolean): Promise<R> 
    async postJsonVoid<T>(path: string, params: T, noAuth?: boolean): Promise<void> 
    async softDeleteCertificate(partial: Partial<DojoCertificateApi>): Promise<number> 
    async softDeleteOutputTag(partial: Partial<DojoOutputTagApi>): Promise<number> 
    async softDeleteTxLabel(partial: Partial<DojoTxLabelApi>): Promise<number> 
    async softDeleteOutputBasket(partial: Partial<DojoOutputBasketApi>): Promise<number> 
    async labelTransaction(txid: string | number | Partial<DojoTransactionApi>, label: string): Promise<void> 
    async unlabelTransaction(txid: string | number | Partial<DojoTransactionApi>, label: string): Promise<void> 
    async tagOutput(partial: Partial<DojoOutputApi>, tag: string): Promise<void> 
    async untagOutput(partial: Partial<DojoOutputApi>, tag: string): Promise<void> 
    async unbasketOutput(partial: Partial<DojoOutputApi>): Promise<void> 
    async getHeight(): Promise<number> 
    async getMerkleRootForHeight(height: number): Promise<string | undefined> 
    async getHeaderForHeight(height: number): Promise<number[] | undefined> 
}
```

See also: [DojoExpressClientOptions](#interface-dojoexpressclientoptions), [internalizeActionSdk](#function-internalizeactionsdk), [processActionSdk](#function-processactionsdk), [relinquishOutputSdk](#function-relinquishoutputsdk), [submitDirectTransaction](#function-submitdirecttransaction)

<details>

<summary>Class DojoExpressClient Details</summary>

##### Constructor

The authrite options setting may be left undefined if it will be created
by NinjaBase.

```ts
constructor(public chain: Chain, public serviceUrl: string, options?: DojoExpressClientOptions) 
```
See also: [DojoExpressClientOptions](#interface-dojoexpressclientoptions)

##### Property syncDojoConfig

Only vaild if this dojo was created as a syncDojo by setSyncDojosByConfig

```ts
syncDojoConfig?: SyncDojoConfigBaseApi
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: ERR_NINJA_INVALID_UNLOCK

Unlocking script for vin ${vin} (${txid}.${vout}) of new transaction is invalid.

```ts
export class ERR_NINJA_INVALID_UNLOCK extends CwiError {
    constructor(public vin: number, public txid: string, public vout: number, public signedRawTx: string, public e?: CwiError) 
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: ERR_NINJA_MISSING_UNLOCK

Unlocking script for vin ${vin} of new transaction is invalid.

```ts
export class ERR_NINJA_MISSING_UNLOCK extends CwiError {
    constructor(vin: number) 
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: Ninja

"Drop-in-replacement" for the original (v1) Ninja

```ts
export class Ninja extends NinjaBase {
    constructor(dojo: NinjaV1Params | DojoClientApi, clientPrivateKey?: string, authrite?: AuthriteClient) 
}
```

See also: [NinjaBase](#class-ninjabase), [NinjaV1Params](#interface-ninjav1params)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: NinjaBase

```ts
export class NinjaBase implements NinjaApi {
    chain?: Chain;
    userId?: number;
    user?: DojoClientUserApi;
    keyDeriver?: sdk.KeyDeriverApi;
    _keyPair: KeyPairApi | undefined;
    _isDojoAuthenticated: boolean;
    dojoIdentity?: DojoIdentityApi;
    pendingSignActions: Record<string, PendingSignAction>;
    constructor(public dojo: DojoClientApi, clientPrivateKey?: string, public authrite?: AuthriteClient) 
    getClientChangeKeyPair(): KeyPairApi 
    async authenticate(identityKey?: string, addIfNew?: boolean): Promise<void> 
    isAuthenticated(): boolean 
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
    async getTransactionLabels(options?: DojoGetTransactionLabelsOptions): Promise<{
        labels: DojoTxLabelApi[];
        total: number;
    }> 
    async getEnvelopeForTransaction(txid: string): Promise<EnvelopeApi | undefined> 
    async processTransaction(params: DojoProcessTransactionParams): Promise<DojoProcessTransactionResultApi> 
    async createAction(params: NinjaCreateActionParams): Promise<NinjaCreateActionResult> 
    async createActionSdk(vargs: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.CreateActionResult> 
    async signActionSdk(vargs: sdk.ValidSignActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.SignActionResult> 
    async abortActionSdk(vargs: sdk.ValidAbortActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.AbortActionResult> 
    async internalizeActionSdk(vargs: sdk.ValidInternalizeActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.InternalizeActionResult> 
    async relinquishOutputSdk(vargs: sdk.ValidRelinquishOutputArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.RelinquishOutputResult> 
    async listCertificatesSdk(vargs: sdk.ValidListCertificatesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListCertificatesResult> 
    async listActions(vargs: sdk.ValidListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListActionsResult> 
    async listOutputs(vargs: sdk.ValidListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListOutputsResult> 
    async getTransactionWithOutputs(params: NinjaGetTransactionWithOutputsParams): Promise<NinjaTransactionWithOutputsResultApi> 
    async createTransactionWithOutputs(params: NinjaGetTransactionWithOutputsParams): Promise<NinjaTransactionWithOutputsResultApi> 
    async processTransactionWithOutputs(params: NinjaGetTransactionWithOutputsParams): Promise<NinjaTransactionWithOutputsResultApi> 
    async signAction(params: NinjaSignActionParams): Promise<NinjaSignActionResultApi> 
    async abortAction(params: NinjaAbortActionParams): Promise<NinjaAbortActionResultApi> 
    async createTransaction(params: NinjaCreateTransactionParams): Promise<DojoCreateTransactionResultApi> 
    async deleteCertificate(partial: Partial<DojoCertificateApi>): Promise<number> 
    async labelTransaction(txid: string | number | Partial<DojoTransactionApi>, label: string): Promise<void> 
    async unlabelTransaction(txid: string | number | Partial<DojoTransactionApi>, label: string): Promise<void> 
    async tagOutput(output: {
        txid: string;
        vout: number;
    }, tag: string): Promise<void> 
    async untagOutput(output: {
        txid: string;
        vout: number;
    }, tag: string): Promise<void> 
    async unbasketOutput(output: {
        txid: string;
        vout: number;
    }): Promise<void> 
    async submitDirectTransaction(params: NinjaSubmitDirectTransactionParams): Promise<NinjaSubmitDirectTransactionResultApi> 
    async getEnvelopesOfConflictingTransactions(txid: string): Promise<EnvelopeApi[]> 
    async getHeight(): Promise<number> 
    async getMerkleRootForHeight(height: number): Promise<string | undefined> 
    async getHeaderForHeight(height: number): Promise<number[] | undefined> 
    async getInfo(params: GetInfoParams): Promise<GetInfoResult> 
}
```

See also: [KeyPairApi](#interface-keypairapi), [NinjaAbortActionParams](#interface-ninjaabortactionparams), [NinjaAbortActionResultApi](#interface-ninjaabortactionresultapi), [NinjaApi](#interface-ninjaapi), [NinjaCreateActionParams](#interface-ninjacreateactionparams), [NinjaCreateActionResult](#interface-ninjacreateactionresult), [NinjaCreateTransactionParams](#interface-ninjacreatetransactionparams), [NinjaGetTransactionOutputsResultApi](#interface-ninjagettransactionoutputsresultapi), [NinjaGetTransactionWithOutputsParams](#interface-ninjagettransactionwithoutputsparams), [NinjaGetTransactionsResultApi](#interface-ninjagettransactionsresultapi), [NinjaSignActionParams](#interface-ninjasignactionparams), [NinjaSignActionResultApi](#interface-ninjasignactionresultapi), [NinjaSubmitDirectTransactionParams](#interface-ninjasubmitdirecttransactionparams), [NinjaSubmitDirectTransactionResultApi](#interface-ninjasubmitdirecttransactionresultapi), [NinjaTransactionFailedHandler](#type-ninjatransactionfailedhandler), [NinjaTransactionProcessedHandler](#type-ninjatransactionprocessedhandler), [NinjaTransactionWithOutputsResultApi](#interface-ninjatransactionwithoutputsresultapi), [PendingSignAction](#interface-pendingsignaction), [abortAction](#function-abortaction), [createActionSdk](#function-createactionsdk), [createTransactionWithOutputs](#function-createtransactionwithoutputs), [getTransactionWithOutputs](#function-gettransactionwithoutputs), [internalizeActionSdk](#function-internalizeactionsdk), [processPendingTransactions](#function-processpendingtransactions), [processTransactionWithOutputs](#function-processtransactionwithoutputs), [relinquishOutputSdk](#function-relinquishoutputsdk), [signAction](#function-signaction), [signActionSdk](#function-signactionsdk), [submitDirectTransaction](#function-submitdirecttransaction)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: NinjaV2

A ninja that also creates a default DojoClientExpress syncDojo configured to sync an existing user's state
from a dojoURL parameter (either https://staging-dojo.babbage.systems or https://dojo.babbage.systems by default)

```ts
export class NinjaV2 extends NinjaBase {
    constructor(dojo: DojoClientApi, clientPrivateKey: string, chain: Chain) 
}
```

See also: [NinjaBase](#class-ninjabase)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Functions

| | | |
| --- | --- | --- |
| [abortAction](#function-abortaction) | [invoice3241645161d8](#function-invoice3241645161d8) | [processTransactionWithOutputs](#function-processtransactionwithoutputs) |
| [buildBsvTxFromCreateTransactionResult](#function-buildbsvtxfromcreatetransactionresult) | [makeAtomicBeef](#function-makeatomicbeef) | [relinquishOutputSdk](#function-relinquishoutputsdk) |
| [completeSignedTransaction](#function-completesignedtransaction) | [makeUnlockTestRawTxBabbageBsv](#function-makeunlocktestrawtxbabbagebsv) | [signAction](#function-signaction) |
| [convertToDojoTxInputsApi](#function-converttodojotxinputsapi) | [needsSignAction](#function-needssignaction) | [signActionSdk](#function-signactionsdk) |
| [createActionSdk](#function-createactionsdk) | [ninjaCreateAction](#function-ninjacreateaction) | [signCreatedTransaction](#function-signcreatedtransaction) |
| [createTransactionWithOutputs](#function-createtransactionwithoutputs) | [ninjaProcessTransaction](#function-ninjaprocesstransaction) | [submitDirectTransaction](#function-submitdirecttransaction) |
| [getTransactionWithOutputs](#function-gettransactionwithoutputs) | [processActionSdk](#function-processactionsdk) | [unpackFromCreateTransactionResult](#function-unpackfromcreatetransactionresult) |
| [getUnlockingScriptLength](#function-getunlockingscriptlength) | [processIncomingTransaction](#function-processincomingtransaction) | [validateDefaultParams](#function-validatedefaultparams) |
| [internalizeActionSdk](#function-internalizeactionsdk) | [processPendingTransactions](#function-processpendingtransactions) |  |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Function: abortAction

```ts
export async function abortAction(ninja: NinjaBase, params: NinjaAbortActionParams): Promise<NinjaAbortActionResultApi> 
```

See also: [NinjaAbortActionParams](#interface-ninjaabortactionparams), [NinjaAbortActionResultApi](#interface-ninjaabortactionresultapi), [NinjaBase](#class-ninjabase)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: buildBsvTxFromCreateTransactionResult

Constructs a

```ts
export async function buildBsvTxFromCreateTransactionResult(ninjaInputs: Record<string, NinjaTxInputsApi>, createResult: DojoCreateTransactionResultApi, changeKeys: KeyPairApi): Promise<{
    tx: Transaction;
    outputMap: Record<string, number>;
    amount: number;
    log?: string;
}> 
```

See also: [KeyPairApi](#interface-keypairapi), [NinjaTxInputsApi](#interface-ninjatxinputsapi)

<details>

<summary>Function buildBsvTxFromCreateTransactionResult Details</summary>

Argument Details

+ **ninjaInputs**
  + Ninja inputs as passed to createAction
+ **createResult**
  + Create transaction results returned by dojo createTransaction
+ **changeKeys**
  + Dummy keys can be used to create a transaction with which to generate Ninja input lockingScripts.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: completeSignedTransaction

```ts
export async function completeSignedTransaction(prior: PendingSignAction, spends: Record<number, sdk.SignActionSpend>, ninja: NinjaBase): Promise<Transaction> 
```

See also: [NinjaBase](#class-ninjabase), [PendingSignAction](#interface-pendingsignaction)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: convertToDojoTxInputsApi

Convert NinjaTxInputsApi to DojoTxInputsApi to protect unlocking scripts.

```ts
export function convertToDojoTxInputsApi(inputs: Record<string, NinjaTxInputsApi>): Record<string, DojoTxInputsApi> 
```

See also: [NinjaTxInputsApi](#interface-ninjatxinputsapi)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: createActionSdk

```ts
export async function createActionSdk(ninja: NinjaBase, vargs: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.CreateActionResult> 
```

See also: [NinjaBase](#class-ninjabase)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: createTransactionWithOutputs

```ts
export async function createTransactionWithOutputs(ninja: NinjaBase, params: NinjaGetTransactionWithOutputsParams): Promise<NinjaTransactionWithOutputsResultApi> 
```

See also: [NinjaBase](#class-ninjabase), [NinjaGetTransactionWithOutputsParams](#interface-ninjagettransactionwithoutputsparams), [NinjaTransactionWithOutputsResultApi](#interface-ninjatransactionwithoutputsresultapi)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: getTransactionWithOutputs

```ts
export async function getTransactionWithOutputs(ninja: NinjaBase, params: NinjaGetTransactionWithOutputsParams): Promise<NinjaTransactionWithOutputsResultApi> 
```

See also: [NinjaBase](#class-ninjabase), [NinjaGetTransactionWithOutputsParams](#interface-ninjagettransactionwithoutputsparams), [NinjaTransactionWithOutputsResultApi](#interface-ninjatransactionwithoutputsresultapi)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: getUnlockingScriptLength

```ts
export function getUnlockingScriptLength(script: string | number): number 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: internalizeActionSdk

Internalize Action allows a wallet to take ownership of outputs in a pre-existing transaction.
The transaction may, or may not already be known to both the storage and user.

Two types of outputs are handled: "wallet payments" and "basket insertions".

A "basket insertion" output is considered a custom output and has no effect on the wallet's "balance".

A "wallet payment" adds an outputs value to the wallet's change "balance". These outputs are assigned to the "default" basket.

Processing starts with simple validation and then checks for a pre-existing transaction.
If the transaction is already known to the user, then the outputs are reviewed against the existing outputs treatment,
and merge rules are added to the arguments passed to the storage layer.
The existing transaction must be in the 'unproven' or 'completed' status. Any other status is an error.

When the transaction already exists, the description is updated. The isOutgoing sense is not changed.

"basket insertion" Merge Rules:
1. The "default" basket may not be specified as the insertion basket.
2. A change output in the "default" basket may not be target of an insertion into a different basket.
3. These baskets do not affect the wallet's balance and are typed "custom".

"wallet payment" Merge Rules:
1. Targetting an existing change "default" basket output results in a no-op. No error. No alterations made.
2. Targetting a previously "custom" non-change output converts it into a change output. This alters the transaction's `amount`, and the wallet balance.

```ts
export async function internalizeActionSdk(ninja: NinjaBase, vargs: sdk.ValidInternalizeActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.InternalizeActionResult> 
```

See also: [NinjaBase](#class-ninjabase)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: invoice3241645161d8

Combine inputs per protocol 3241645161d8 to generate an 'invoice' string used for cryptographic key generation.

```ts
export function invoice3241645161d8(prefix: string, suffix: string, paymail?: string): string 
```

<details>

<summary>Function invoice3241645161d8 Details</summary>

Argument Details

+ **prefix**
  + Typically a random string unique to a single transaction.
+ **suffix**
  + Typically a random string unique to a single output in that transaction.
+ **paymail**
  + An optional paymail handle

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: makeAtomicBeef

```ts
export function makeAtomicBeef(tx: Transaction, beef: number[] | Beef): number[] 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: makeUnlockTestRawTxBabbageBsv

```ts
export async function makeUnlockTestRawTxBabbageBsv(params: {
    sourceTXID: string;
    sourceOutputIndex: number;
    lockingScript: string;
    satoshis: number;
    derivationPrefix: string;
    derivationSuffix: string;
    privateKey: string;
    publicKey: string;
}): Promise<string> 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: needsSignAction

```ts
export function needsSignAction(inputs: Record<string, NinjaTxInputsApi>) 
```

See also: [NinjaTxInputsApi](#interface-ninjatxinputsapi)

<details>

<summary>Function needsSignAction Details</summary>

Returns

true if at least one unlockingScript is specified only as a maximum length number.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: ninjaCreateAction

```ts
export async function ninjaCreateAction(ninja: NinjaBase, ninjaParams: NinjaCreateActionParams): Promise<NinjaCreateActionResult> 
```

See also: [NinjaBase](#class-ninjabase), [NinjaCreateActionParams](#interface-ninjacreateactionparams), [NinjaCreateActionResult](#interface-ninjacreateactionresult)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: ninjaProcessTransaction

```ts
export async function ninjaProcessTransaction(ninja: NinjaBase, params: DojoProcessTransactionParams): Promise<DojoProcessTransactionResultApi> 
```

See also: [NinjaBase](#class-ninjabase)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: processActionSdk

```ts
export async function processActionSdk(prior: PendingSignAction | undefined, ninja: NinjaBase, args: sdk.ValidProcessActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.SendWithResult[] | undefined> 
```

See also: [NinjaBase](#class-ninjabase), [PendingSignAction](#interface-pendingsignaction)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: processIncomingTransaction

Verifies protocol '3241645161d8' output scripts with derivedSuffix based addresses.
Computes transaction 'amount'.

```ts
export async function processIncomingTransaction(ninja: NinjaBase, incomingTransaction: ProcessIncomingTransactionApi, protocol?: string, updateStatus?: boolean): Promise<ProcessIncomingTransactionResultApi> 
```

See also: [NinjaBase](#class-ninjabase), [ProcessIncomingTransactionApi](#interface-processincomingtransactionapi), [ProcessIncomingTransactionResultApi](#interface-processincomingtransactionresultapi)

<details>

<summary>Function processIncomingTransaction Details</summary>

Returns

Void on error if onTransactionFailed handler is provided.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: processPendingTransactions

```ts
export async function processPendingTransactions(ninja: NinjaBase, onTransactionProcessed?: NinjaTransactionProcessedHandler, onTransactionFailed?: NinjaTransactionFailedHandler, onOutgoingTransaction?: NinjaOutgoingTransactionHandler): Promise<void> 
```

See also: [NinjaBase](#class-ninjabase), [NinjaOutgoingTransactionHandler](#type-ninjaoutgoingtransactionhandler), [NinjaTransactionFailedHandler](#type-ninjatransactionfailedhandler), [NinjaTransactionProcessedHandler](#type-ninjatransactionprocessedhandler)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: processTransactionWithOutputs

```ts
export async function processTransactionWithOutputs(ninja: NinjaBase, params: NinjaGetTransactionWithOutputsParams): Promise<NinjaTransactionWithOutputsResultApi> 
```

See also: [NinjaBase](#class-ninjabase), [NinjaGetTransactionWithOutputsParams](#interface-ninjagettransactionwithoutputsparams), [NinjaTransactionWithOutputsResultApi](#interface-ninjatransactionwithoutputsresultapi)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: relinquishOutputSdk

```ts
export async function relinquishOutputSdk(ninja: NinjaBase, vargs: sdk.ValidRelinquishOutputArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.RelinquishOutputResult> 
```

See also: [NinjaBase](#class-ninjabase)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: signAction

```ts
export async function signAction(ninja: NinjaBase, params: NinjaSignActionParams): Promise<NinjaSignActionResultApi> 
```

See also: [NinjaBase](#class-ninjabase), [NinjaSignActionParams](#interface-ninjasignactionparams), [NinjaSignActionResultApi](#interface-ninjasignactionresultapi)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: signActionSdk

```ts
export async function signActionSdk(ninja: NinjaBase, vargs: sdk.ValidSignActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.SignActionResult> 
```

See also: [NinjaBase](#class-ninjabase)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: signCreatedTransaction

```ts
export async function signCreatedTransaction(ninja: NinjaBase, params: NinjaSignCreatedTransactionParams): Promise<NinjaTransactionWithOutputsResultApi> 
```

See also: [NinjaBase](#class-ninjabase), [NinjaSignCreatedTransactionParams](#interface-ninjasigncreatedtransactionparams), [NinjaTransactionWithOutputsResultApi](#interface-ninjatransactionwithoutputsresultapi)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: submitDirectTransaction

```ts
export async function submitDirectTransaction(ninja: NinjaBase, params: NinjaSubmitDirectTransactionParams): Promise<NinjaSubmitDirectTransactionResultApi> 
```

See also: [NinjaBase](#class-ninjabase), [NinjaSubmitDirectTransactionParams](#interface-ninjasubmitdirecttransactionparams), [NinjaSubmitDirectTransactionResultApi](#interface-ninjasubmitdirecttransactionresultapi)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: unpackFromCreateTransactionResult

```ts
export function unpackFromCreateTransactionResult(ninjaInputs: Record<string, NinjaTxInputsApi>, createResult: DojoCreateTransactionResultApi): {
    amount: number;
    referenceNumber: string;
    inputs: Record<string, OptionalEnvelopeEvidenceApi>;
} 
```

See also: [NinjaTxInputsApi](#interface-ninjatxinputsapi)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateDefaultParams

```ts
export function validateDefaultParams(params: NinjaGetTransactionWithOutputsParams, logLabel?: string) 
```

See also: [NinjaGetTransactionWithOutputsParams](#interface-ninjagettransactionwithoutputsparams)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Types

| |
| --- |
| [NinjaOutgoingTransactionHandler](#type-ninjaoutgoingtransactionhandler) |
| [NinjaTransactionFailedHandler](#type-ninjatransactionfailedhandler) |
| [NinjaTransactionProcessedHandler](#type-ninjatransactionprocessedhandler) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Type: NinjaOutgoingTransactionHandler

```ts
export type NinjaOutgoingTransactionHandler = (tx: DojoPendingTxApi) => Promise<boolean>
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: NinjaTransactionFailedHandler

```ts
export type NinjaTransactionFailedHandler = (args: NinjaTransactionFailedApi) => Promise<void>
```

See also: [NinjaTransactionFailedApi](#interface-ninjatransactionfailedapi)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: NinjaTransactionProcessedHandler

```ts
export type NinjaTransactionProcessedHandler = (args: NinjaTransactionProcessedApi) => Promise<void>
```

See also: [NinjaTransactionProcessedApi](#interface-ninjatransactionprocessedapi)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variables

#### Variable: invoice3241645161d8Protocol

```ts
invoice3241645161d8Protocol = "2-3241645161d8"
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

<!--#endregion ts2md-api-merged-here-->

## License

The license for the code in this repository is the Open BSV License.