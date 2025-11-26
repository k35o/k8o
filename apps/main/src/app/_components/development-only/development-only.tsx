import type { FC, PropsWithChildren } from 'react';

export const DevelopmentOnly: FC<
  PropsWithChildren<{ onProduction?: () => void }>
> = ({ children, onProduction }) => {
  if (process.env['VERCEL_ENV'] === 'production') {
    if (onProduction) {
      onProduction();
    }
    return null;
  }

  return children;
};
