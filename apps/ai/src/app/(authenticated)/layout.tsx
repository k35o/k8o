import type { ReactNode } from 'react';

import styles from './layout.module.css';

// 認証ゲートは page 側（Suspense 配下の Gate）と middleware で行う。layout を sync に保つ
// ことで Cache Components の prerender（uncached データを Suspense 外で触れない）を満たす。
export default function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    // 全画面ツールなのでカードで囲まずビューポートいっぱいに作業領域を取る。
    <div className={styles.root}>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
