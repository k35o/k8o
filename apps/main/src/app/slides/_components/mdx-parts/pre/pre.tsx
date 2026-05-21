import type { FC, ReactNode } from 'react';

import styles from './pre.module.css';

export const Pre: FC<{ children?: ReactNode }> = ({ children }) => (
  <pre className={styles['pre']}>{children}</pre>
);
