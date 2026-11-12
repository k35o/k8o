import styles from './print-color-adjust-example.module.css';

export const PrintColorAdjustExample = () => (
  <div className={styles.root}>
    <div className={styles.item}>指定なし</div>
    <div className={styles.item} data-print-color-adjust="exact">
      exact
    </div>
  </div>
);
