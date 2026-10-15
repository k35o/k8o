import type { ReactNode } from 'react';

import styles from './public-layout.module.css';

export function PublicLayout({ children }: { children: ReactNode }) {
  return <main className={styles.root}>{children}</main>;
}
