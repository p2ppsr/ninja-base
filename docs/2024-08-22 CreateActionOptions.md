# CreateActionOptions: Controlling Processing Options For Transaction Creation

## AcceptDelayedBroadcast

`acceptDelayedBroadcast` defaults to `true` if unspecified. Transactions are sent to the bitcoin network by a background process,
typically several seconds after the createAction function returns. This same background process is also responsible for
collecting proofs from the network for new transactions which typically happens many minutes after sending.

Setting `acceptDelayedBroadcast` to `false` causes the transaction to be sent to the bitcoin network
before `createAction` returns.
This adds a noticeable delay in the speed of transaction creation. A short time after sending, the transaction and its new
outputs will be recognized by the network if they are referenced as inputs by following transactions.
Note that there is always an unpredictable delay from when a transaction is sent and when its new outputs are available.
This generally only affects applications that create chained transaction sequences.
For this situation, consider using the `noSend` and `sendWith` options.

## ResultFormat

`resultFormat` defaults to Everett Style Envelopes and rawTx values for transaction creation results.

Setting `resultFormat` to `'beef'` causes `createAction` results to include a serialized `beef` property,
instead of `rawTx` and `inputs`.

Setting `resultFormat` to `'none'` causes `createAction` results to include only the `txid` property of any new
transaction.

## TrustSelf

`trustSelf` defaults to `false` if unspecified. All new transaction inputs must include validity proofs,
and results will include the new rawTx and a validity proof. Validity proofs can become large when they
include chains of large transactions.

Setting `trustSelf` to `'known'` minimizes the data that must be included with inputs.
Inputs do not require rawTx or validity proofs if the txid provided corresponds to a transaction already known by Dojo.

## NoSend

`noSend` defaults to `false` if unspecified. Transactions are sent to the bitcoin network either by a background process (the default) or as the final step of `createAction` (when `acceptDelayedBroadcast` is `false`).

Setting `noSend` to `true` creates valid, signed transactions but leaves them unsent in the Dojo database.
The background transaction monitoring process will continue to check if these transactions end up on-chain,
but will not automatically send them. The results from `noSend` transaction creation will also include an
array of any `noSendChange` outputs generated. This array can be forwarded into chained `noSend` transactions.

This is useful in a number of scenarios such as:

    1. Creating transactions offline.
    2. Creating transactions to be held in escrow.
    3. Creating batches of transactions to be sent to the network together. (See `sendWith`)
    4. Testing transaction creation.

## NoSendChange

`noSendChange` defaults to an empty array.

Setting `noSendChange` to an array of Dojo change outputs obtained from the results of an earlier `noSend` transaction
allows forwarding `noSend` transaction change outputs into chained `noSend` transaction inputs.
This can be useful to minimize the number of change outputs tied up in an unsent chain of `noSend` transactions.

## SendWith

`sendWith` defaults to an empty array.

Setting `sendWith` to an array of `txid` values for previously created `noSend` transactions causes all of them to be sent to the bitcoin network as a single batch of transactions.
When using `sendWith`, `createAction` an be called without inputs or outputs, in which case previously created `noSend` transactions will be sent without creating a new transaction.

## KnownTxids

`knownTxids` defaults to an empty array.

Setting `knownTxids` to an array of unchecked `txid` values causes Dojo's validity proof checking and generation to
treat those as valid, even if they are unknown to Dojo.
