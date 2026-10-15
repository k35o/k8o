import type { FC } from 'react';

import styles from './details-content-demo.module.css';

export const DetailsContentDemo: FC = () => (
  <div>
    <details className={styles.childrenBordered}>
      <summary>detailsの子要素全てにスタイルを割り当て</summary>
      <p>p要素1</p>
      <p>p要素2</p>
      <p>p要素3</p>
    </details>
    <details className={styles.contentBordered}>
      <summary>::details-contentを用いてslot要素に割り当て</summary>
      <p>p要素1</p>
      <p>p要素2</p>
      <p>p要素3</p>
    </details>
  </div>
);
