import Link from 'next/link';
import type { FC } from 'react';

const TOOLS = [
  { href: '/', label: 'UI' },
  { href: '/slides', label: 'スライド' },
] as const;

type ToolHref = (typeof TOOLS)[number]['href'];

// AI ツール間（UI スタジオ / スライド）の切り替えナビ。各スタジオのヘッダに置く。
export const ToolNav: FC<{ current: ToolHref }> = ({ current }) => (
  <nav aria-label="AI ツール" className="flex shrink-0 items-center gap-1">
    {TOOLS.map((tool) =>
      tool.href === current ? (
        <span
          aria-current="page"
          className="bg-primary-bg-subtle text-primary-fg rounded-md px-2 py-0.5 text-xs font-bold"
          key={tool.href}
        >
          {tool.label}
        </span>
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
