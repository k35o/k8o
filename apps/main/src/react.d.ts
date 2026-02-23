import 'react';

declare module 'react' {
  // Extend the CSSProperties interface to include custom CSS variables
  // biome-ignore lint/style/useConsistentTypeDefinitions: Reactの拡張なのでOK
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }

  // webkitdirectory は標準化前の属性のため、React型に拡張を追加する
  // biome-ignore lint/style/useConsistentTypeDefinitions: Reactの拡張なのでOK
  interface InputHTMLAttributes<T> {
    webkitdirectory?: boolean;
  }
}
