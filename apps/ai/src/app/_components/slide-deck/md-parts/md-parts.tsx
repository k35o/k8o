import type { CSSProperties, FC, ReactNode } from 'react';

import styles from './md-parts.module.css';

type Props = { children?: ReactNode };

// apps/main の slides の mdx-parts を移植したもの。cqi 単位でスライドの
// コンテナサイズに追従する（通常のテキストスケールは使わない）。
export const H1: FC<Props> = ({ children }) => (
  <h1 className={styles.h1}>{children}</h1>
);

export const H2: FC<Props> = ({ children }) => (
  <h2 className={styles.h2}>{children}</h2>
);

export const H3: FC<Props> = ({ children }) => (
  <h3 className={styles.h3}>{children}</h3>
);

export const H4: FC<Props> = ({ children }) => (
  <h4 className={styles.h4}>{children}</h4>
);

export const P: FC<Props> = ({ children }) => (
  <p className={styles.p}>{children}</p>
);

export const Ul: FC<Props> = ({ children }) => (
  <ul className={styles.ul}>{children}</ul>
);

export const Ol: FC<Props> = ({ children }) => (
  <ol className={styles.ol}>{children}</ol>
);

export const Li: FC<Props> = ({ children }) => (
  <li className={styles.li}>{children}</li>
);

export const Strong: FC<Props> = ({ children }) => (
  <strong className={styles.strong}>{children}</strong>
);

// style はハイライト済みコードの配色（背景・文字色）の上書き用。
export const Pre: FC<Props & { style?: CSSProperties | undefined }> = ({
  children,
  style,
}) => (
  <pre className={styles.pre} style={style}>
    {children}
  </pre>
);

export const Blockquote: FC<Props> = ({ children }) => (
  <blockquote className={styles.blockquote}>{children}</blockquote>
);
