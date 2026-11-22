import type { FC } from 'react';

import styles from './progress-bar.module.css';

// range の input にすると、押したあとにフォーカスが残ってデッキのキー操作が効かなくなる
export const ProgressBar: FC<{
  current: number;
  total: number;
  onSeek: (index: number) => void;
}> = ({ current, total, onSeek }) => {
  const percent = total === 0 ? 0 : ((current + 1) / total) * 100;
  return (
    <div
      aria-hidden="true"
      className={styles.root}
      onClick={(event) => {
        const { left, width } = event.currentTarget.getBoundingClientRect();
        onSeek(Math.floor(((event.clientX - left) / width) * total));
      }}
    >
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${percent.toString()}%` }}
        />
      </div>
    </div>
  );
};
