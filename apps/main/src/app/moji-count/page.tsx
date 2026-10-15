import { TextField } from './_components/text-field';

import styles from './page.module.css';

export default function Counter() {
  return (
    <section className={styles.root}>
      <TextField />
      <div className={styles.note}>
        <p className={styles.noteText}>
          ※書記素単位に分解して文字数を計測しています
        </p>
      </div>
    </section>
  );
}
