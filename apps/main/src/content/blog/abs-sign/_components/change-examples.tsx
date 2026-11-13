import styles from './change-examples.module.css';

const DELTAS = [-2.5, 0, 1.2] as const;

export const ChangeExamples = () => (
  <div className={styles.root}>
    {DELTAS.map((delta) => (
      <span className={styles.change} key={delta} style={{ '--delta': delta }}>
        {delta}%
      </span>
    ))}
  </div>
);
