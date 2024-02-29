import { CwiError } from "cwi-base";

/**
 * Unlocking script for vin ${vin} (${txid}.${vout}) of new transaction is invalid.
 */
export class ERR_NINJA_INVALID_UNLOCK extends CwiError {
    constructor(public vin: number, public txid: string, public vout: number, public signedRawTx: string, public e?: CwiError)
    { super(
        'ERR_NINJA_INVALID_UNLOCK',
        `Unlocking script for vin ${vin} (${txid}.${vout}) of new transaction is invalid. ${signedRawTx}${e ? `\n\n${e.message}` : ''}`
        ) 
    } 
}

/**
 * Unlocking script for vin ${vin} of new transaction is invalid.
 */
export class ERR_NINJA_MISSING_UNLOCK extends CwiError { constructor(vin: number) { super('ERR_NINJA_MISSING_UNLOCK', `Unlocking script validation for vin ${vin} is missing.`) } }