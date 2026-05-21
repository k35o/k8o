import { cn } from '@repo/helpers/cn';
import type { FC, ReactNode } from 'react';

import styles from './blockquote.module.css';

export const Blockquote: FC<{ children?: ReactNode }> = ({ children }) => (
  <blockquote
    className={cn(styles['blockquote'], 'text-fg-mute border-primary-border')}
  >
    {children}
  </blockquote>
);
