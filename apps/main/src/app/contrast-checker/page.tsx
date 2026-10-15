import { CheckContrast } from './_components/check-contrast';
import { Description } from './_components/description';

import styles from './page.module.css';

export default function Page() {
  return (
    <section className={styles.root}>
      <CheckContrast />
      <Description />
    </section>
  );
}
