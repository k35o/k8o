import Link from 'next/link';
import { Suspense } from 'react';

import { Copyright } from './copyright';

import styles from './footer.module.css';

export function Footer() {
  return (
    <footer className={styles.root}>
      <nav aria-label="サイト情報">
        <ul className={styles.links}>
          <li>
            <Link className={styles.link} href="/about">
              About
            </Link>
          </li>
          <li>
            <Link className={styles.link} href="/contact">
              Contact
            </Link>
          </li>
          <li>
            <Link className={styles.link} href="/privacy">
              Privacy
            </Link>
          </li>
        </ul>
      </nav>
      <Suspense
        fallback={
          <p className={styles.copyright}>
            ©︎ 2024〜2026 k8o. All Rights Reserved.
          </p>
        }
      >
        <Copyright />
      </Suspense>
    </footer>
  );
}
