import { cn } from '@repo/helpers/cn';
import type { CSSProperties, FC, ReactNode } from 'react';

import styles from './md-parts.module.css';

type Props = { children?: ReactNode };

// apps/main の slides の mdx-parts を移植したもの。cqi 単位でスライドの
// コンテナサイズに追従する（通常のテキストスケールは使わない）。
export const H1: FC<Props> = ({ children }) => (
  <h1 className={styles['h1']}>{children}</h1>
);

export const H2: FC<Props> = ({ children }) => (
  <h2 className={cn(styles['h2'], 'text-primary-fg border-primary-border')}>
    {children}
  </h2>
);

export const H3: FC<Props> = ({ children }) => (
  <h3 className={cn(styles['h3'], 'text-primary-fg border-primary-border')}>
    {children}
  </h3>
);

export const H4: FC<Props> = ({ children }) => (
  <h4 className={cn(styles['h4'], 'text-secondary-fg')}>{children}</h4>
);

export const P: FC<Props> = ({ children }) => (
  <p className={styles['p']}>{children}</p>
);

export const UL: FC<Props> = ({ children }) => (
  <ul className={styles['ul']}>{children}</ul>
);

export const OL: FC<Props> = ({ children }) => (
  <ol className={styles['ol']}>{children}</ol>
);

export const LI: FC<Props> = ({ children }) => (
  <li className={cn(styles['li'], 'marker:text-primary-border')}>{children}</li>
);

export const Strong: FC<Props> = ({ children }) => (
  <strong className="text-primary-fg font-bold">{children}</strong>
);

// style はハイライト済みコードの配色（背景・文字色）の上書き用。
export const Pre: FC<Props & { style?: CSSProperties | undefined }> = ({
  children,
  style,
}) => (
  <pre className={styles['pre']} style={style}>
    {children}
  </pre>
);

export const Blockquote: FC<Props> = ({ children }) => (
  <blockquote
    className={cn(styles['blockquote'], 'text-fg-mute border-primary-border')}
  >
    {children}
  </blockquote>
);
