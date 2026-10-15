import type { FC, ReactNode } from 'react';

import styles from './cover.module.css';

type Props = { children?: ReactNode };

export const Cover: FC<Props> = ({ children }) => (
  <div className={styles.root}>{children}</div>
);

// 表紙では H1 を大見出し、H2 をサブタイトル、p を補足情報として描く。
export const CoverTitle: FC<Props> = ({ children }) => (
  <h1 className={styles.title}>{children}</h1>
);

export const CoverSubtitle: FC<Props> = ({ children }) => (
  <h2 className={styles.subtitle}>{children}</h2>
);

export const CoverText: FC<Props> = ({ children }) => (
  <p className={styles.text}>{children}</p>
);
