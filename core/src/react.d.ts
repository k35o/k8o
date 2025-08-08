import 'react';

declare module 'react' {
  // Extend the CSSProperties interface to include custom CSS variables
  type CSSProperties = {
    [key: `--${string}`]: string | number | undefined;
  };
}
