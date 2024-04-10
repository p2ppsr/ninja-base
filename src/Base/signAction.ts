import { NinjaBase } from './NinjaBase'
import {
  NinjaSignActionParams,
  NinjaSignActionResultApi,
} from '../Api/NinjaApi'
import { signCreatedTransaction } from './signCreatedTransaction'
import { stampLog } from 'cwi-base';

export async function signAction(ninja: NinjaBase, params: NinjaSignActionParams)
: Promise<NinjaSignActionResultApi>
{
  params.createResult.log = stampLog(params.createResult.log || '', "start ninja signAction");

  const r = await signCreatedTransaction(ninja, params)

  params.createResult.log = stampLog(params.createResult.log, "end ninja signAction");

  return r
}