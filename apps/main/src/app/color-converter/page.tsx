import { ColorConverter } from './_components/color-converter';

import styles from './page.module.css';

export default function Page() {
  return (
    <section className={styles.root}>
      <ColorConverter />
    </section>
  );
}
