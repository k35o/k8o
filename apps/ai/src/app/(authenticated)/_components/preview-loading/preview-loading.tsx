import type { FC } from 'react';

import styles from './preview-loading.module.css';

type PreviewLoadingProps = {
  message: string;
};

// プレビュー枠を覆う待ち表示のオーバーレイ（プロジェクト読込中など）。
// 親（プレビュー枠）を relative にして上に重ね、待ちが解けたら呼び出し側が外す。
// 背景は bg-surface で塗り、前回の描画が透けないようにする。
export const PreviewLoading: FC<PreviewLoadingProps> = ({ message }) => (
  <div className={styles.root}>
    <div aria-hidden className={styles.spinner} />
    <p aria-live="polite" className={styles.message}>
      {message}
    </p>
  </div>
);
