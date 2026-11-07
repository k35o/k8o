import type { FC, ReactNode } from 'react';

import styles from './strong.module.css';

export const Strong: FC<{ children?: ReactNode }> = ({ children }) => (
  <strong className={styles.root}>{children}</strong>
);
