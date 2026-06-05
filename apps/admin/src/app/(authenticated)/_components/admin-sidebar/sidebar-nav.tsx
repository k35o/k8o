'use client';

import { cn } from '@repo/helpers/cn';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { FC } from 'react';

import { NAV_GROUPS } from './nav-items';

// トップ('/')は完全一致、それ以外は前方一致で現在地を判定する。
const isActive = (pathname: string, href: string): boolean =>
  href === '/'
    ? pathname === '/'
    : pathname === href || pathname.startsWith(`${href}/`);

export const SidebarNav: FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const pathname = usePathname();

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
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
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
                <Icon size="sm" />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
};
