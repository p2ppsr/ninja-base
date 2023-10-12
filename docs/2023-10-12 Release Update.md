# Ninja 2023-10-12 Release Update

## 1. Get User's Transaction Labels

### Original Requirement

Ninja functionality to get a list of all a user's transaction labels that start with a contain prefix (in this case, babbage_app_, for showing the grid of apps. You also need to track a last-used time for labels and allow querying in ascending or descending order.

### Potential Issues With As Implemented

1. The `transactionId` optional property in `options` was added by misunderstanding.
1. Returned labels could be mapped to a more restrictive type than `DojoTxLabelsApi`.
   
### As Implemented

```ts
getTransactionLabels(options?: DojoGetTransactionLabelsOptions): Promise<{
    labels: DojoTxLabelApi[];
    total: number;
}>
```

Returns transaction labels matching options and total matching count available.

Argument Details

+ **options**
  + limit defaults to 25, offset defaults to 0, order defaults to 'descending'

#### Interface: DojoGetTransactionLabelsOptions

```ts
export interface DojoGetTransactionLabelsOptions extends DojoGetTransactionsBaseOptions {
    prefix?: string;
    transactionId?: number;
    sortBy?: DojoTransactionLabelsSortBy;
}
```

##### Property prefix

Optional. Filters labels to include only those starting with the specified prefix.

```ts
prefix?: string
```

##### Property sortBy

Optional. Specify whether to sort by 'label' or 'whenLastUsed'.

```ts
sortBy?: DojoTransactionLabelsSortBy
```

##### Property transactionId

Optional. Filters labels to include only those associated with the specified transaction ID.

```ts
transactionId?: number
```

#### Interface: DojoTxLabelApi

```ts
export interface DojoTxLabelApi extends DojoEntityTimeStampApi {
    txLabelId?: number;
    created_at?: Date | null;
    updated_at?: Date | null;
    label: string;
    userId: number;
    whenLastUsed?: Date | null;
    isDeleted?: boolean;
}
```

##### Property isDeleted

Optional. Indicates whether the label is deleted. isDeleted defaults to false.

```ts
isDeleted?: boolean
```

##### Property label

max length of 150
e.g. babbage_app_..., babbage_protocol_..., babbage_spend_..., babbage_basket_..., babbage_cert_...., babbage_certificate_, nanostore

```ts
label: string
```

##### Property whenLastUsed

valid only when retrieved by with the 'whenLastUsed' sort option.

```ts
whenLastUsed?: Date | null
```

## 2. Optionaly Get Tx Inputs and Outputs

### Original Requirement

When an optional parameter is provided, return the list of inputs and outputs for a transaction within getTransactions, including the spendingDescriptions on inputs and the descriptions on outputs. This will let us properly build the transaction list in the MetaNet Client.

### Potential Issues With As Implemented

1. `total` isn't returned with separate array of potentially partial results. Done for backward compatibility?
2. `inputs` and `outputs` result array types generally match `getTransactionOutputs` results. Should they be further customized?j
   
### As Implemented

#### Method getTransactions

Returns a set of transactions that match the criteria. A new `addInputsAndOutputs: boolean` property has been added to `options`.

```ts
getTransactions(options?: DojoGetTransactionsOptions): Promise<NinjaGetTransactionsResultApi>
```

Argument Details

+ **options**
  + limit defaults to 25, offset defaults to 0, addLabels defaults to true, order defaults to 'descending'

#### Interface: NinjaGetTransactionsResultApi

```ts
export interface NinjaGetTransactionsResultApi {
    totalTransactions: number;
    transactions: NinjaGetTransactionsTxApi[];
}
```

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
    inputs?: NinjaGetTransactionsTxInputApi[];
    outputs?: NinjaGetTransactionsTxOutputApi[];
}
```

#### Interface: NinjaGetTransactionsTxInputApi

```ts
export interface NinjaGetTransactionsTxInputApi {
    txid: string;
    vout: number;
    amount: number;
    outputScript: string;
    type: string;
    spendable: boolean;
    spendingDescription?: string;
}
```

##### Property amount

Number of satoshis in the output

```ts
amount: number
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

#### Interface: NinjaGetTransactionsTxOutputApi

```ts
export interface NinjaGetTransactionsTxOutputApi {
    txid: string;
    vout: number;
    amount: number;
    outputScript: string;
    type: string;
    spendable: boolean;
    description?: string;
}
```

##### Property amount

Number of satoshis in the output

```ts
amount: number
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

## 3. Delete Certificate and Remove Output From Basket

### Original Requirement

You need to move on to deleting certificates and removing outputs from baskets, and surface the Ninja-level functionality.

### Potential Issues With As Implemented

1. Deleting a certificate is a soft delete. A new `isDeleted` property is set to true. This is forced by the sync protocol
   
### As Implemented
   
##### Method deleteCertificate

Soft deletes a certificate.

```ts
deleteCertificate(partial: Partial<DojoCertificateApi>): Promise<number>
```

Argument Details

+ **partial**
  + The partial certificate data identifying the certificate to soft delete.

##### Method unbasketOutput

Removes the uniquely identified output's basket assignment.

The output will no longer belong to any basket.

This is typically only useful for outputs that are no longer usefull.

```ts
unbasketOutput(partial: Partial<DojoOutputApi>): Promise<void>
```

Argument Details

+ **partial**
  + unique output identifier as a partial pattern.


## 4. Add Output Tags

### Original Requirement

You need to add output tags with similar properties as transaction labels into the system.

### Potential Issues With As Implemented

1. `output_tags` and `output_tags_map` tables added, like for labels, both with soft delete support.
2. `tagOutput` and `untagOutput` are modeled on `labelTransaction` and `unlabelTransaction`.
3. The transaction to label, for backwards compatibility, supports transactionId and txid options in addition
to the partial option that matches how the output tag methods work. In all cases the option used to identify the
item to be tagged or labeled must identify a single transaction.
   
### As Implemented
   
##### Method tagOutput

Tags an output

Validates user is authenticated, partial identifies a single output, and tag value.

Creates new tag if necessary.

Adds tag to output if not already tagged.

```ts
tagOutput(partial: Partial<DojoOutputApi>, tag: string): Promise<void>
```

Argument Details

+ **partial**
  + unique output identifier as a partial pattern.
+ **tag**
  + the tag to add, will be created if it doesn't already exist

##### Method untagOutput

Removes a tag from an output

Validates user is authenticated, partial identifies a single output, and tag already exits.

Does nothing if output is not tagged.

```ts
untagOutput(partial: Partial<DojoOutputApi>, tag: string): Promise<void>
```

Argument Details

+ **partial**
  + unique output identifier as a partial pattern.
+ **tag**
  + the tag to be removed from the output

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
