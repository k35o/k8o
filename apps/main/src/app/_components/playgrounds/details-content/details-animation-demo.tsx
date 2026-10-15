import type { FC } from 'react';

import styles from './details-animation-demo.module.css';

export const DetailsAnimationDemo: FC = () => (
  <div className={styles.root}>
    <details className={styles.detailsAnimation}>
      <summary className={styles.summary}>
        ::details-contentによるアニメーション
      </summary>
      <p>想定した通りにアニメーションが適用されます</p>
    </details>
    <p className={styles.note}>
      例として実装したアニメーションは@prefers-reduced-motionに対応していません。注意してご利用ください。
    </p>
  </div>
);
