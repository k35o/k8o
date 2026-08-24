'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useEffectEvent, useRef } from 'react';

// URL の ?project=<id> とスタジオの選択状態の同期。両スタジオで共用する。
// boot: 初回マウントで一度だけ ?project= を読み、あれば onBoot でロードする
// （Strict Mode の二重実行は bootedRef で防ぐ）。
// sync: projectId が null のとき（初期 / boot 中 / 新規）は書き換えない。boot の
// ?project を握り潰さず、実行回数ではなく値で判定するため二重実行でも安全。
// 新規化でのベースパス戻しは呼び出し側の handleNewProject が行う。
export const useProjectUrlSync = (
  basePath: '/' | '/slides',
  projectId: number | null,
  onBoot: (projectId: number) => void,
): void => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // URL の ?project=<id> を初回レンダーで一度だけ拾い、リロード/ブックマークから復元する。
  const bootProjectIdRef = useRef<number | null | undefined>(undefined);
  if (bootProjectIdRef.current === undefined) {
    const raw = searchParams.get('project');
    const id = raw === null ? Number.NaN : Number(raw);
    bootProjectIdRef.current = Number.isInteger(id) && id > 0 ? id : null;
  }

  const bootLoad = useEffectEvent(onBoot);
  const bootedRef = useRef(false);
  useEffect(() => {
    if (bootedRef.current) {
      return;
    }
    bootedRef.current = true;
    const bootId = bootProjectIdRef.current;
    if (bootId !== null && bootId !== undefined) {
      bootLoad(bootId);
    }
  }, []);

  useEffect(() => {
    if (projectId === null) {
      return;
    }
    router.replace(`${basePath}?project=${projectId.toString()}`);
  }, [basePath, projectId, router]);
};
