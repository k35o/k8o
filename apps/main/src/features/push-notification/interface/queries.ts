import type { InferResponseType } from 'hono/client';
import { cacheLife } from 'next/cache';

import type { publicApi } from '@/shared/api/public-api';

import { getPushLogs as _getPushLogs } from '../application/get-push-logs';

// ビルド時の値はブラウザで api の GET の値に差し替えるので、型を api の応答にそろえ、
// 形がずれたら型検査で止める
export type PushLogs = InferResponseType<
  (typeof publicApi)['public']['push-logs']['$get'],
  200
>;

export async function getPushLogs(): Promise<PushLogs> {
  'use cache';
  cacheLife('max');

  return { logs: await _getPushLogs() };
}
