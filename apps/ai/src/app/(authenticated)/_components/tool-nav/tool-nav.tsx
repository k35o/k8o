import { AssistantIcon, PaletteIcon, SlideIcon } from '@k8ordo/ui';
import Link from 'next/link';
import type { FC, ReactNode } from 'react';

export type StudioTool = 'ui' | 'slides' | 'chat';

const TOOLS: Array<{
  tool: StudioTool;
  href: '/' | '/slides' | '/chat';
  label: string;
  icon: ReactNode;
}> = [
  { tool: 'ui', href: '/', label: 'UI', icon: <PaletteIcon size="sm" /> },
  {
    tool: 'slides',
    href: '/slides',
    label: 'スライド',
    icon: <SlideIcon size="sm" />,
  },
  {
    tool: 'chat',
    href: '/chat',
    label: 'チャット',
    icon: <AssistantIcon size="sm" />,
  },
];

type ToolNavProps = {
  current: StudioTool;
  onNavigate?: (() => void) | undefined;
};

export const ToolNav: FC<ToolNavProps> = ({ current, onNavigate }) => (
  <nav aria-label="AI ツール" className="flex flex-col gap-1">
    {TOOLS.map((item) =>
      item.tool === current ? (
        // 現在地。自己遷移すると作業中の状態（?project= や書きかけのチャット）が落ちるため
        // 無効化しつつ、読み上げのために Link + aria-current のまま残す。
        <Link
          aria-current="page"
          className="bg-primary-bg-subtle text-primary-fg pointer-events-none flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold"
          href={item.href}
          key={item.tool}
          tabIndex={-1}
        >
          {item.icon}
          {item.label}
        </Link>
      ) : (
        <Link
          className="text-fg-mute hover:bg-bg-mute hover:text-fg-base flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors duration-150"
          href={item.href}
          key={item.tool}
          onNavigate={() => {
            onNavigate?.();
          }}
        >
          {item.icon}
          {item.label}
        </Link>
      ),
    )}
  </nav>
);
