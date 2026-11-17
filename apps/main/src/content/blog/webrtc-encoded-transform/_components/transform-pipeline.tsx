import styles from './transform-pipeline.module.css';

type Step = {
  label: string;
  note?: string;
};

const SENDER: readonly Step[] = [
  { label: '映像の入力' },
  { label: 'エンコード' },
  { label: 'Transform', note: 'Workerで暗号化' },
];

const RECEIVER: readonly Step[] = [
  { label: 'Transform', note: 'Workerで復号' },
  { label: 'デコード' },
  { label: '表示' },
];

const Steps = ({ steps }: { steps: readonly Step[] }) => (
  <ol className={styles.steps}>
    {steps.map((step) => (
      <li
        className={styles.step}
        data-transform={step.note !== undefined}
        key={step.label}
      >
        {step.label}
        {step.note !== undefined && (
          <span className={styles.note}>{step.note}</span>
        )}
      </li>
    ))}
  </ol>
);

export const TransformPipeline = () => (
  <figure
    aria-label="送信側と受信側で、Transformを挟む位置"
    className={styles.root}
  >
    <div className={styles.side}>
      <p className={styles.sideLabel}>送信側</p>
      <Steps steps={SENDER} />
    </div>
    <span aria-hidden="true" className={styles.down}>
      ↓
    </span>
    <p className={styles.network}>ネットワーク</p>
    <span aria-hidden="true" className={styles.down}>
      ↓
    </span>
    <div className={styles.side}>
      <p className={styles.sideLabel}>受信側</p>
      <Steps steps={RECEIVER} />
    </div>
  </figure>
);
