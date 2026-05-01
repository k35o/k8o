import 'react';

declare module 'react' {
  // Extend the CSSProperties interface to include custom CSS variables
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }

  // webkitdirectory は標準化前の属性のため、React型に拡張を追加する
  interface InputHTMLAttributes<T> {
    webkitdirectory?: boolean;
  }

  // Invoker Commands API は標準化直後の属性のため、React型に拡張を追加する
  interface ButtonHTMLAttributes<T> {
    command?: string;
    commandfor?: string;
  }
}
