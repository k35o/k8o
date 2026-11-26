import type { InferResponseType } from 'hono/client';

import { publicApi, readOrNull } from '@/shared/api/public-api';

export type ReadingDay = NonNullable<
  InferResponseType<
    (typeof publicApi)['public']['reading-list']['latest']['$get'],
    200
  >['day']
>;

let pending: Promise<ReadingDay | null> | undefined;

// use は渡された promise に結果を覚えさせるので、文書の中では同じ promise を返し、ホームへ戻った
// ときに待たずに描く。読めなかった結果も覚え、文書を読み直すまでカードを出さない
export const loadLatestReadingDay = (): Promise<ReadingDay | null> => {
  pending ??= readOrNull(publicApi.public['reading-list'].latest.$get()).then(
    (body) => body?.day ?? null,
  );
  return pending;
};

export const resetLatestReadingDay = (): void => {
  pending = undefined;
};
