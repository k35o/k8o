import type { ReactNode } from 'react';

import { ToolFrame } from './_components/tool-frame';
import { OpeningThreadProvider } from './chat/_components/opening-thread';
import { TouchedThreadsProvider } from './chat/_components/touched-threads';

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
    <div className="bg-bg-surface flex h-dvh flex-col">
      <TouchedThreadsProvider>
        <OpeningThreadProvider>
          <ToolFrame sidebar={sidebar}>{children}</ToolFrame>
        </OpeningThreadProvider>
      </TouchedThreadsProvider>
    </div>
  );
}
