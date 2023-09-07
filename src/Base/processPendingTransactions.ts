import { NinjaTransactionFailedApi, NinjaTransactionFailedHandler, NinjaTransactionProcessedApi, NinjaTransactionProcessedHandler } from '../Api/NinjaApi'
import { ProcessIncomingTransactionResultApi, processIncomingTransaction } from './processIncomingTransaction'
import { NinjaBase } from './NinjaBase'
import { CwiError, asString } from 'cwi-base'

export async function processPendingTransactions (
  ninja: NinjaBase,
  onTransactionProcessed?: NinjaTransactionProcessedHandler,
  onTransactionFailed?: NinjaTransactionFailedHandler
): Promise<void> {
  const dojo = ninja.dojo

  const pending = await dojo.getPendingTransactions()

  await Promise.all(pending.map(async ptx => {
    let pitr: ProcessIncomingTransactionResultApi | undefined
    try {
      if (!ptx.isOutgoing) {
        pitr = await processIncomingTransaction(
          ninja,
          ptx,
          undefined,
          true
        )
      } else {
        // Pending outgoing transactions ...

        // TODO: The key architectural issue with processing outgoing transactions in parallel
        // from Dojo getPendingTransactions is that Dojo must never store UTXO unlocking scripts.
        // To make this work, the unlocking scripts would need to be merged with the Dojo pending
        // transactions before they could be processed... for now, log any transactions that pass
        // through this code path...

        console.log(`processPendingTransactions outgoing transaction reference ${ptx.referenceNumber} ignored`)

        // If we were going to process, re-use of code used by the createTransaction / processTransaction
        // const { tx, outputMap, amount } = NinjaTxBuilder.buildJsTxFromPendingTx(ninja, ptx)
      }
      if ((onTransactionProcessed != null) && (pitr != null)) {
        try {
          const r: NinjaTransactionProcessedApi = {
            inputs: ptx.inputs,
            outputs: ptx.outputs,
            reference: ptx.referenceNumber,
            hex: asString(ptx.rawTransaction || ''),
            isOutgoing: ptx.isOutgoing,
            txid: pitr.txid,
            amount: pitr.amount,
            senderIdentityKey: pitr.senderIdentityKey,
            derivationPrefix: pitr.derivationPrefix
          }
          await onTransactionProcessed(r)
        } catch (e: unknown) {
          console.error('onTransactionProcessed callback threw', e)
        }
      }
    } catch (e: unknown) {
      if (onTransactionFailed != null) {
        try {
          const r: NinjaTransactionFailedApi = {
            inputs: ptx.inputs,
            reference: ptx.referenceNumber,
            isOutgoing: ptx.isOutgoing,
            error: CwiError.fromUnknown(e)
          }
          await onTransactionFailed(r)
        } catch (e: unknown) {
          console.error('onTransactionFailed callback threw', e)
        }
      }
    }
  }))
}
