import type { FC, ReactNode } from 'react';

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
  <div className="grid min-h-0 flex-1 grid-rows-1 lg:grid-cols-[440px_minmax(0,1fr)]">
    <div
      className={`border-border-mute min-h-0 min-w-0 flex-col lg:flex lg:border-r ${
        mobilePane === 'chat' ? 'flex' : 'hidden'
      }`}
    >
      {chat}
    </div>
    <div
      className={`min-h-0 min-w-0 flex-col overflow-hidden lg:flex ${
        mobilePane === 'chat' ? 'hidden' : 'flex'
      }`}
    >
      {panel}
    </div>
  </div>
);
