import { range } from '@repo/helpers/array/range';
import { cn } from '@repo/helpers/cn';
import type { FC } from 'react';

import styles from './studio-skeleton.module.css';

// Studio のシェル（サイドバー＋ヘッダ＋チャット列＋プレビュー列）を模した骨組み。
// 認証ゲート（DB/cookie）の解決中やスタジオへの遷移中に、白画面ではなく構造を見せて
// 待ちのブロック感を減らす。
export const StudioSkeleton: FC = () => (
  <div aria-busy aria-label="読み込み中" className={styles.root}>
    <div className={styles.sidebar}>
      <div className={cn(styles.bone, styles.brand)} />
      <div className={cn(styles.bone, styles.newButton)} />
      <div className={styles.nav}>
        {range(0, 2).map((n) => (
          <div
            className={cn(styles.bone, styles.navItem)}
            key={`studio-nav-skeleton-${n}`}
          />
        ))}
      </div>
      <div className={styles.projects}>
        {range(0, 4).map((n) => (
          <div
            className={cn(styles.bone, styles.project)}
            key={`studio-project-skeleton-${n}`}
          />
        ))}
      </div>
    </div>
    <div className={styles.main}>
      <div className={styles.header}>
        <div className={cn(styles.bone, styles.title)} />
        <div className={styles.actions}>
          <div className={cn(styles.bone, styles.action)} />
          <div className={cn(styles.bone, styles.action)} />
        </div>
      </div>
      <div className={styles.panes}>
        <div className={styles.chat}>
          {range(0, 4).map((n) => (
            <div className={styles.message} key={`studio-msg-skeleton-${n}`}>
              <div className={cn(styles.bone, styles.messageLabel)} />
              <div className={cn(styles.bone, styles.messageBody)} />
            </div>
          ))}
        </div>
        <div className={styles.preview}>
          <div className={cn(styles.bone, styles.previewBody)} />
        </div>
      </div>
    </div>
  </div>
);
