import { NinjaOutgoingTransactionHandler, NinjaTransactionFailedApi, NinjaTransactionFailedHandler, NinjaTransactionProcessedApi, NinjaTransactionProcessedHandler } from '../Api/NinjaApi'
import { processIncomingTransaction } from './processIncomingTransaction'
import { NinjaBase } from './NinjaBase'
import { CwiError, asString } from 'cwi-base'

export async function processPendingTransactions (
  ninja: NinjaBase,
  onTransactionProcessed?: NinjaTransactionProcessedHandler,
  onTransactionFailed?: NinjaTransactionFailedHandler,
  onOutgoingTransaction?: NinjaOutgoingTransactionHandler
): Promise<void> {
  const dojo = ninja.dojo

  const pending = await dojo.getPendingTransactions()

  await Promise.all(pending.map(async ptx => {
    try {
      if (ptx.isOutgoing) {
        // Pending outgoing transactions ...

        /**
Transaction processing in Dojo / Ninja fundamentaly divides responsibility according to their roles.

Dojo must never have the ability to initiate the spending of utxos. Only Ninja controls the ability to sign utxos
such that they can spent. Dojo's role is to manage persistance of utxos and the history of spending transactions.

The Ninja method `processPendingTransactions` can violate this security boundary if it just automatically signs
transactions retreived from Dojo. It would then be possible for Dojo to control the signing process simply by creating
arbitrary transactions and forwarding them to Ninja for signing.

The Ninja `signCreatedTransaction` and `processTransaction` methods may be useful.
         */

        let handled = false
        if (onOutgoingTransaction) {
          try {
            handled = await onOutgoingTransaction(ptx)
          } catch (e: unknown) {
            console.error('onOutgoingTransaction callback threw', e)
          }
        } else {
          console.log(`processPendingTransactions outgoing transaction reference ${ptx.referenceNumber} ignored`)
        }
        if (!handled) {
          await ninja.dojo.updateTransactionStatus(ptx.referenceNumber, 'failed')
        }

      } else {
        const pitr = await processIncomingTransaction( ninja, ptx, undefined, true)
        if (onTransactionProcessed) {
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
