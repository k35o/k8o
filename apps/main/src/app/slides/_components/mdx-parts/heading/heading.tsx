import { cn } from '@repo/helpers/cn';
import type { FC, ReactNode } from 'react';

import styles from './heading.module.css';

type Props = { children?: ReactNode };

export const H1: FC<Props> = ({ children }) => (
  <h1 className={styles['h1']}>{children}</h1>
);

export const H2: FC<Props> = ({ children }) => (
  <h2 className={cn(styles['h2'], 'text-primary-fg border-primary-border')}>
    {children}
  </h2>
);

export const H3: FC<Props> = ({ children }) => (
  <h3 className={cn(styles['h3'], 'text-primary-fg border-primary-border')}>
    {children}
  </h3>
);

export const H4: FC<Props> = ({ children }) => (
  <h4 className={cn(styles['h4'], 'text-secondary-fg')}>{children}</h4>
);
