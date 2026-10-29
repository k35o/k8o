import type { FC, ReactNode } from 'react';

import styles from './list.module.css';

type Props = { children?: ReactNode };

export const UL: FC<Props> = ({ children }) => (
  <ul className={styles.unordered}>{children}</ul>
);

export const OL: FC<Props> = ({ children }) => (
  <ol className={styles.ordered}>{children}</ol>
);

export const LI: FC<Props> = ({ children }) => (
  <li className={styles.item}>{children}</li>
);
