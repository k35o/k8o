import 'react';

declare module 'react' {
  // Extend the CSSProperties interface to include custom CSS variables
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style -- interfaceでRecordを宣言できないため
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
