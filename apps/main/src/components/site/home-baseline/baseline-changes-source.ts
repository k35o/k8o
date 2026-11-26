import type { InferResponseType } from 'hono/client';

import { publicApi, readOrNull } from '@/shared/api/public-api';

export type BaselineChange = InferResponseType<
  (typeof publicApi)['public']['browser-support']['recent-changes']['$get'],
  200
>['recentChanges'][number];

let pending: Promise<BaselineChange[] | null> | undefined;

// use は渡された promise に結果を覚えさせるので、文書の中では同じ promise を返し、ホームへ戻った
// ときに待たずに描く。読めなかった結果も覚え、文書を読み直すまでカードを出さない
export const loadBaselineChanges = (): Promise<BaselineChange[] | null> => {
  pending ??= readOrNull(
    publicApi.public['browser-support']['recent-changes'].$get(),
  ).then((body) => body?.recentChanges ?? null);
  return pending;
};

export const resetBaselineChanges = (): void => {
  pending = undefined;
};
