import type { FC, ReactNode } from 'react';

import styles from './cover.module.css';

export const Cover: FC<{ children?: ReactNode }> = ({ children }) => (
  <div className={styles.root}>{children}</div>
);
