/// <reference types="react/experimental" />
import 'react';

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }

  interface InputHTMLAttributes<T> {
    webkitdirectory?: boolean;
  }

  interface ButtonHTMLAttributes<T> {
    command?: string;
    commandfor?: string;
  }
}
