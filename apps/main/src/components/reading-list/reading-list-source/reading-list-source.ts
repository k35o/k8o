import type { InferResponseType } from 'hono/client';

import { publicApi, readOrNull } from '@/shared/api/public-api';

export type ReadingList = InferResponseType<
  (typeof publicApi)['public']['reading-list']['$get'],
  200
>;

let pending: Promise<ReadingList | null> | undefined;
let skipsPreload = false;

// use は渡された promise に結果を覚えさせるので、文書の中では同じ promise を返し、戻る・進むで
// 一覧を待たずに描く。初めの描画が suspend すると React は useState の初期化をやり直すので、読めな
// かった結果もここでは捨てず、案内を出してから forgetFailedReadingList で捨てる
export const loadReadingList = (): Promise<ReadingList | null> => {
  pending ??= readOrNull(
    publicApi.public['reading-list'].$get(
      undefined,
      // WebKit は文書の中で、preload の応答を失敗したものも同じ URL の fetch に使い回す
      skipsPreload ? { init: { cache: 'reload' } } : undefined,
    ),
  );
  return pending;
};

export const forgetFailedReadingList = (
  failed: Promise<ReadingList | null>,
): void => {
  if (pending === failed) {
    pending = undefined;
  }
  skipsPreload = true;
};

export const resetReadingList = (): void => {
  pending = undefined;
  skipsPreload = false;
};
