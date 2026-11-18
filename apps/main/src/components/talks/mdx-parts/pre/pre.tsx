import { cn } from '@repo/helpers/cn';
import type { ComponentProps, FC } from 'react';

import styles from './pre.module.css';

export const Pre: FC<
  Pick<ComponentProps<'pre'>, 'children' | 'className' | 'style'>
> = ({ children, className, style }) => (
  <pre className={cn(styles.root, className)} style={style}>
    {children}
  </pre>
);
