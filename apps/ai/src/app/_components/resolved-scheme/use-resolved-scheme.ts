'use client';

import { useColorScheme } from '@k8ordo/color-scheme';

import { useHydrated } from '../hydrated';

type Scheme = ReturnType<typeof useColorScheme>['scheme'];

// サーバーと hydrate の描画では、useColorScheme の scheme は既定の light で、利用者の配色ではない。
// 配色で取りに行くもの（コードのハイライト）が light で取ってから取り直さないよう、決まるまでは null を返す
export const useResolvedScheme = (): Scheme | null => {
  const { scheme } = useColorScheme();
  const isHydrated = useHydrated();
  return isHydrated ? scheme : null;
};
