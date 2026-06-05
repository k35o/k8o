import {
  BlogIcon,
  MailIcon,
  RSSIcon,
  SendIcon,
  ShieldCheckIcon,
  SlideIcon,
  TableIcon,
  TagIcon,
  ViewIcon,
} from '@k8o/arte-odyssey';
import type { FC } from 'react';

type IconProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
};

export type NavItem = {
  href: string;
  label: string;
  icon: FC<IconProps>;
};

export type NavGroup = {
  // null の場合は見出しなし（概要グループ）
  label: string | null;
  items: NavItem[];
};

// サイドバーのナビゲーション定義。グループごとに小見出しを付ける。
// 新しい管理セクションを追加するときは該当グループに項目を足す。
export const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [{ href: '/', label: 'ダッシュボード', icon: ViewIcon }],
  },
  {
    label: 'コンテンツ',
    items: [
      { href: '/blogs', label: 'ブログ', icon: BlogIcon },
      { href: '/slides', label: 'スライド', icon: SlideIcon },
      { href: '/talks', label: 'トーク', icon: TableIcon },
      { href: '/tags', label: 'タグ', icon: TagIcon },
    ],
  },
  {
    label: '読み物',
    items: [{ href: '/reading-list', label: 'よんでいるもの', icon: RSSIcon }],
  },
  {
    label: '運用',
    items: [
      { href: '/comments', label: 'お問い合わせ', icon: MailIcon },
      { href: '/notifications', label: '通知', icon: SendIcon },
      { href: '/reports', label: 'レポート', icon: TableIcon },
      { href: '/baseline', label: 'Baseline', icon: ShieldCheckIcon },
    ],
  },
];
