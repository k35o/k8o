'use client';

import { useEffect } from 'react';
import type { FC } from 'react';

export const ReactScan: FC = () => {
  useEffect(() => {
    // 描く側で dev に限っても、このモジュールは本番の client のバンドルに入る。react-scan を
    // 静的に読むと、読み込みの処理（devtools の hook・requestAnimationFrame の上書き）が
    // どのページでも走るので、dev のときだけここで読む
    if (!import.meta.env.DEV) {
      return;
    }
    void import('react-scan').then(({ scan }) => {
      scan({
        enabled: false,
        showToolbar: true,
      });
    });
  }, []);

  return null;
};
