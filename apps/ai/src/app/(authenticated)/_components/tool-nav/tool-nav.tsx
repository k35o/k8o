import { AssistantIcon, PackageIcon } from '@k8ordo/ui';
import Link from 'next/link';
import type { FC, ReactNode } from 'react';

import styles from './tool-nav.module.css';

export type StudioTool = 'chat' | 'artifacts';

const TOOLS: Array<{
  tool: StudioTool;
  href: '/chat' | '/artifacts';
  label: string;
  icon: ReactNode;
}> = [
  {
    tool: 'chat',
    href: '/chat',
    label: 'チャット',
    icon: <AssistantIcon size="sm" />,
  },
  {
    tool: 'artifacts',
    href: '/artifacts',
    label: '作ったもの',
    icon: <PackageIcon size="sm" />,
  },
];

type ToolNavProps = {
  current: StudioTool | null;
  onNavigate?: (() => void) | undefined;
};

export const ToolNav: FC<ToolNavProps> = ({ current, onNavigate }) => (
  <nav aria-label="AI ツール" className={styles.root}>
    {TOOLS.map((item) =>
      item.tool === current ? (
        // 現在地。自己遷移すると作業中の状態（開いている生成物や書きかけのチャット）が落ちるため
        // 無効化しつつ、読み上げのために Link + aria-current のまま残す。
        <Link
          aria-current="page"
          className={styles.link}
          href={item.href}
          key={item.tool}
          tabIndex={-1}
        >
          {item.icon}
          {item.label}
        </Link>
      ) : (
        <Link
          className={styles.link}
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
