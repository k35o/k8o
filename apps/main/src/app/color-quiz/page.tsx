import { ColorQuiz } from './_components/color-quiz';

import styles from './page.module.css';

export default function Page() {
  return (
    <section className={styles.root}>
      <ColorQuiz />
    </section>
  );
}
