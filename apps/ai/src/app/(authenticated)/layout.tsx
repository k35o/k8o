import type { ReactNode } from 'react';

import { verifySession } from '@/shared/auth/verify-session';

export default async function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  await verifySession();

  return (
    // 全画面ツール。カードで囲まず、ビューポートいっぱいに作業領域を取る
    // （中央寄せ・最大幅・余白を付けない＝フルブリード）。
    <div className="bg-bg-surface flex h-dvh flex-col">
      <main className="flex min-h-0 w-full flex-1 flex-col">{children}</main>
    </div>
  );
}
