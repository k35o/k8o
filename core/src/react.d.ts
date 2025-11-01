import 'react';

declare module 'react' {
  // Extend the CSSProperties interface to include custom CSS variables
  // biome-ignore lint/style/useConsistentTypeDefinitions: Reactの拡張なのでOK
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
