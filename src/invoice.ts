/**
 * Combine inputs per protocol 3241645161d8 to generate an 'invoice' string used for cryptographic key generation.
 * @param prefix Typically a random string unique to a single transaction.
 * @param suffix Typically a random string unique to a single output in that transaction.
 * @param paymail An optional paymail handle
 * @returns
 */
export function invoice3241645161d8 (prefix: string, suffix: string, paymail?: string): string {
  const protocol = invoice3241645161d8Protocol
  const invoice = paymail
    ? `${protocol}-${paymail} ${prefix} ${suffix}`
    : `${protocol}-${prefix} ${suffix}`
  return invoice
}

export const invoice3241645161d8Protocol = '2-3241645161d8'