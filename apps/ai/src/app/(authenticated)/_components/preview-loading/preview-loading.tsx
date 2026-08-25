import type { FC } from 'react';

type PreviewLoadingProps = {
  message: string;
};

// プレビュー枠を覆う待ち表示のオーバーレイ（プロジェクト読込中など）。
// 親（プレビュー枠）を relative にして上に重ね、待ちが解けたら呼び出し側が外す。
// 背景は bg-surface で塗り、前回の描画が透けないようにする。
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
