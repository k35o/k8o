import type { FC, ReactNode } from 'react';

import styles from './paragraph.module.css';

export const P: FC<{ children?: ReactNode }> = ({ children }) => (
  <p className={styles['p']}>{children}</p>
);
