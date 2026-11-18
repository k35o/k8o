import type { ReactNode } from 'react';

import { OpeningThreadProvider } from './_components/opening-thread';
import { ToolFrame } from './_components/tool-frame';
import { TouchedThreadsProvider } from './_components/touched-threads';

import styles from './layout.module.css';

// 認証ゲートは各ページとスロットのページ（Suspense 配下の verifySession）と proxy で行う。layout を
// sync に保つことで Cache Components の prerender（uncached データを Suspense 外で触れない）を満たす。
export default function AuthenticatedLayout({
  children,
  sidebar,
}: {
  children: ReactNode;
  sidebar: ReactNode;
}) {
  return (
    // 全画面ツールなのでカードで囲まずビューポートいっぱいに作業領域を取る。
    <div className={styles.root}>
      <TouchedThreadsProvider>
        <OpeningThreadProvider>
          <ToolFrame sidebar={sidebar}>{children}</ToolFrame>
        </OpeningThreadProvider>
      </TouchedThreadsProvider>
    </div>
  );
}
