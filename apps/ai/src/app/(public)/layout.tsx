import type { ReactNode } from 'react';

import styles from './layout.module.css';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <main className={styles.root}>{children}</main>;
}
