import type { FC, ReactNode } from 'react';

import styles from './studio-panes.module.css';

type StudioPanesProps = {
  // 小画面はタブで1ペインずつ表示する（デスクトップは常に2ペイン並べる）。
  mobilePane: 'chat' | 'panel';
  chat: ReactNode;
  panel: ReactNode;
};

// チャットと作業ペインの2ペイングリッド。
// grid-rows-1 で単一ペインも本体高さを満たす（小画面でメッセージがスクロールするように）。
export const StudioPanes: FC<StudioPanesProps> = ({
  mobilePane,
  chat,
  panel,
}) => (
  <div className={styles.root}>
    <div className={styles.chat} data-active={mobilePane === 'chat'}>
      {chat}
    </div>
    <div className={styles.panel} data-active={mobilePane === 'panel'}>
      {panel}
    </div>
  </div>
);
