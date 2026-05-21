import { cn } from '@repo/helpers/cn';
import type { FC, ReactNode } from 'react';

import styles from './list.module.css';

type Props = { children?: ReactNode };

export const UL: FC<Props> = ({ children }) => (
  <ul className={styles['ul']}>{children}</ul>
);

export const OL: FC<Props> = ({ children }) => (
  <ol className={styles['ol']}>{children}</ol>
);

export const LI: FC<Props> = ({ children }) => (
  <li className={cn(styles['li'], 'marker:text-primary-border')}>{children}</li>
);
