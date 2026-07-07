import Link from 'next/link';
import type { FC } from 'react';

const TOOLS = [
  { href: '/', label: 'UI' },
  { href: '/slides', label: 'スライド' },
] as const;

type ToolHref = (typeof TOOLS)[number]['href'];

// AI ツール間（UI スタジオ / スライド）の切り替えナビ。各スタジオのヘッダに置く。
// 現在地も Link のまま aria-current を付ける（span だと読み上げられない環境がある）。
// 自己遷移すると ?project= が落ちるため、クリック・フォーカスともに無効化する。
export const ToolNav: FC<{ current: ToolHref }> = ({ current }) => (
  <nav aria-label="AI ツール" className="flex shrink-0 items-center gap-1">
    {TOOLS.map((tool) =>
      tool.href === current ? (
        <Link
          aria-current="page"
          className="bg-primary-bg-subtle text-primary-fg pointer-events-none rounded-md px-2 py-0.5 text-xs font-bold"
          href={tool.href}
          key={tool.href}
          tabIndex={-1}
        >
          {tool.label}
        </Link>
      ) : (
        <Link
          className="text-fg-mute hover:text-primary-fg rounded-md px-2 py-0.5 text-xs transition-colors"
          href={tool.href}
          key={tool.href}
        >
          {tool.label}
        </Link>
      ),
    )}
  </nav>
);
