import type { FC } from 'react';

type PreviewLoadingProps = {
  message: string;
};

// プレビューのロード/反映待ちを覆うオーバーレイ。
// 親（プレビュー枠）を relative にして上に重ね、iframe の読み込み完了で呼び出し側が外す。
// 背景は bg-surface で塗り、リロード中の空白や前回の描画が透けないようにする。
export const PreviewLoading: FC<PreviewLoadingProps> = ({ message }) => (
  <div className="bg-bg-surface absolute inset-0 z-10 flex flex-col items-center justify-center gap-3">
    <div
      aria-hidden
      className="border-border-mute border-t-fg-base size-8 rounded-full border-2 motion-safe:animate-spin"
    />
    <p
      aria-live="polite"
      className="text-fg-mute text-sm leading-relaxed motion-safe:animate-pulse"
    >
      {message}
    </p>
  </div>
);
