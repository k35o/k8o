import type { FC, ReactNode } from 'react';

import styles from './chat-panes.module.css';

type ChatPanesProps = {
  chat: ReactNode;
  pane: ReactNode | null;
  mobilePane: 'chat' | 'pane';
  expanded: boolean;
};

// 会話をいつも同じ要素の最初の子に置き、ペインは2番目の子として出し入れする。
// 開け閉めや xl 未満の切り替え、ペインを広げるときに会話をマウントし直さず、スクロール位置と生成 UI の入力を残すため
export const ChatPanes: FC<ChatPanesProps> = ({
  chat,
  pane,
  mobilePane,
  expanded,
}) => {
  const shown = pane === null ? 'chat' : mobilePane;
  const expandedPane = pane !== null && expanded;
  return (
    <div
      className={styles.root}
      data-expanded={expandedPane}
      data-has-pane={pane !== null}
    >
      <div
        className={styles.column}
        data-collapsed={expandedPane}
        data-shown={shown === 'chat'}
      >
        {chat}
      </div>
      {pane === null ? null : (
        <div
          className={styles.pane}
          data-expanded={expandedPane}
          data-shown={shown === 'pane'}
        >
          {pane}
        </div>
      )}
    </div>
  );
};
