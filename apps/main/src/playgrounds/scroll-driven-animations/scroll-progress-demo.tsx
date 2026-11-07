import { range } from '@repo/helpers/array/range';

import styles from './scroll-progress-demo.module.css';

const demoStyle = `@keyframes sda-grow {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

.sda-progress {
  position: sticky;
  top: 0;
  transform-origin: 0 50%;
  animation: sda-grow auto linear;
  animation-timeline: scroll();
}`;

export function ScrollProgressDemo() {
  return (
    <div className={styles.root}>
      <style>{demoStyle}</style>

      <section
        aria-label="スクロール量をプログレスバーで示す領域"
        className={styles.scroller}
        tabIndex={0}
      >
        <div aria-hidden="true" className={`sda-progress ${styles.progress}`} />
        <div className={styles.list}>
          {range(0, 12).map((n) => (
            <p className={styles.item} key={`sda-paragraph-${n}`}>
              {`段落 ${n + 1}：スクロールすると、上のバーが読み進めた割合だけ伸びます。`}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
