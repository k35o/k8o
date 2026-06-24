import type { ReactNode } from 'react';

// 認証ゲートは page 側（Suspense 配下の Gate）と middleware で行う。layout を sync に保つ
// ことで Cache Components の prerender（uncached データを Suspense 外で触れない）を満たす。
export default function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    // 全画面ツールなのでカードで囲まずビューポートいっぱいに作業領域を取る。
    <div className="bg-bg-surface flex h-dvh flex-col">
      <main className="flex min-h-0 w-full flex-1 flex-col">{children}</main>
    </div>
  );
}
