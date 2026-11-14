import { getPublicPushLogs } from '@repo/api/build-data';
import type { InferResponseType } from 'hono/client';

import type { publicApi } from '@/shared/api/public-api';

// ビルド時の値はブラウザで api の GET の値に差し替えるので、型を api の応答にそろえ、
// 形がずれたら型検査で止める
export type PushLogs = InferResponseType<
  (typeof publicApi)['public']['push-logs']['$get'],
  200
>;

export const getPushLogs = async (): Promise<PushLogs> => ({
  logs: await getPublicPushLogs(),
});
