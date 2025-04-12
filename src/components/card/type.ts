import { PropsWithChildren } from 'react';

export type CardProps = PropsWithChildren<{
  variant?: 'primary' | 'secondary';
  title?: string;
  width?: 'full' | 'fit';
}>;
