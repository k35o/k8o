import type { FC, ReactNode } from 'react';

export const Strong: FC<{ children?: ReactNode }> = ({ children }) => (
  <strong className="text-primary-fg font-bold">{children}</strong>
);
