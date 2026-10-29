import type { FC, ReactNode } from 'react';

import styles from './blockquote.module.css';

export const Blockquote: FC<{ children?: ReactNode }> = ({ children }) => (
  <blockquote className={styles.root}>{children}</blockquote>
);
