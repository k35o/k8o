import type { FC, PropsWithChildren } from 'react';

// レジストリ未登録 / 描画失敗のコンポーネントの代役。コンポーネント名は画面に出さず、
// 子があれば子をそのまま流し、葉は無地ブロックで場所だけ確保する
// （Sandbox の本描画に切り替わると実体で置き換わる）。
export const UnknownPlaceholder: FC<PropsWithChildren<{ name: string }>> = ({
  name,
  children,
}) => {
  if (children !== undefined) {
    return children;
  }
  const shape = name.endsWith('Icon')
    ? 'size-5 rounded-sm'
    : 'h-8 w-full max-w-40 rounded-md';
  return (
    <span
      aria-hidden
      data-testid="unknown-placeholder"
      className={`bg-bg-mute inline-block animate-pulse align-middle ${shape}`}
    />
  );
};
