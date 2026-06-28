'use client';

import { Spinner } from '@k8o/arte-odyssey';
import { cn } from '@repo/helpers/cn';
import type { Route } from 'next';
import Link, { useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';
import type { FC } from 'react';

import { NAV_GROUPS } from './nav-items';

const isActive = (pathname: string, href: string): boolean =>
  href === '/'
    ? pathname === '/'
    : pathname === href || pathname.startsWith(`${href}/`);

type NavIcon = (typeof NAV_GROUPS)[number]['items'][number]['icon'];

// useLinkStatus は <Link> の子孫でのみ機能する。Link 内に置き、遷移中の保留状態を取得して
// クリックしたリンクだけにスピナーを出す（どのメニューを押したかが即わかる）。
const NavItemContent: FC<{ Icon: NavIcon; label: string }> = ({
  Icon,
  label,
}) => {
  const { pending } = useLinkStatus();
  return (
    <>
      <Icon size="sm" />
      <span className="flex-1 truncate">{label}</span>
      {pending ? <Spinner label="読み込み中" size="sm" /> : null}
    </>
  );
};

export const SidebarNavList: FC<{
  pathname: string | null;
  onNavigate?: () => void;
}> = ({ pathname, onNavigate }) => {
  const handleNavigate = (): void => {
    onNavigate?.();
  };

  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      {NAV_GROUPS.map((group) => (
        <div className="flex flex-col gap-1" key={group.label ?? 'overview'}>
          {group.label !== null && (
            <p className="text-fg-mute px-3 pb-1 text-xs font-medium">
              {group.label}
            </p>
          )}
          {group.items.map((item) => {
            const active = pathname !== null && isActive(pathname, item.href);
            return (
              <Link
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-primary-bg-subtle text-primary-fg font-bold'
                    : 'text-fg-mute hover:bg-bg-mute hover:text-fg-base',
                )}
                href={item.href as Route}
                key={item.href}
                onClick={handleNavigate}
              >
                <NavItemContent Icon={item.icon} label={item.label} />
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
};

export const SidebarNav: FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const pathname = usePathname();

  return (
    <SidebarNavList
      {...(onNavigate === undefined ? {} : { onNavigate })}
      pathname={pathname}
    />
  );
};
