import 'react';

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }

  interface InputHTMLAttributes<T> {
    // React は知らない属性の true を描かずに捨てるので、空文字で渡させる
    webkitdirectory?: '';
  }

  interface ButtonHTMLAttributes<T> {
    command?: string;
    commandfor?: string;
  }
}
