import type { FC, PropsWithChildren } from 'react';

// レジストリ未登録 / 描画失敗のコンポーネントを可視化するフォールバック。
// PoC では「サブセット外がどこに出るか」をそのまま見えるようにして網羅率を測る。
export const UnknownChip: FC<PropsWithChildren<{ name: string }>> = ({
  name,
  children,
}) => (
  <span className="border-border-mute text-fg-mute inline-flex items-center gap-1 rounded-md border border-dashed px-2 py-1 text-xs">
    <span className="font-mono">{`<${name || 'fragment'}>`}</span>
    {children}
  </span>
);
