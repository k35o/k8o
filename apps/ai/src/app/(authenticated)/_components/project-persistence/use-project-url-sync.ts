'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useEffectEvent } from 'react';

import { parseProjectId } from './parse-project-id';

export const useProjectUrlSync = (
  projectId: number | null,
  on: { load: (projectId: number) => void; reset: () => void },
): void => {
  const urlProjectId = parseProjectId(useSearchParams().get('project'));
  const follow = useEffectEvent((next: number | null) => {
    if (next === projectId) {
      return;
    }
    if (next === null) {
      on.reset();
    } else {
      on.load(next);
    }
  });
  // 隠れた画面も描き直されて今の URL（別のツールの ?project=）を読むので、
  // render 中ではなく、見えているあいだに走る effect でだけ合わせる
  useEffect(() => {
    follow(urlProjectId);
  }, [urlProjectId]);
};
