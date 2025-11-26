import { InteractiveCard } from '@k8o/arte-odyssey/card';
import { ChevronIcon } from '@k8o/arte-odyssey/icons';
import { Separator } from '@k8o/arte-odyssey/separator';
import { cn } from '@repo/helpers/cn';
import type { Route } from 'next';
import Link from 'next/link';
import type { FC } from 'react';

export const TagCard: FC<{
  title: string;
  href: Route;
  count?: number;
  label: string;
  linkLabel: string;
}> = ({ title, href, count, label, linkLabel }) => {
  return (
    <InteractiveCard width="fit">
      <Link
        aria-label={linkLabel}
        className={cn(
          'flex h-full w-70 flex-col gap-2 rounded-lg border border-transparent p-4',
          'group',
          'hover:border-primary-border hover:bg-primary-bg-mute hover:text-primary-fg',
        )}
        href={href}
      >
        <div className="flex w-full basis-full items-center justify-between">
          <span className="font-bold text-lg">{title}</span>
          {count && (
            <span className="min-w-8 rounded-full bg-primary-bg px-2 py-1 text-center text-primary-fg">
              {count}
            </span>
          )}
        </div>
        <Separator />
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm">{label}</span>
          <span className="hidden group-hover:block">
            <ChevronIcon direction="right" size="sm" />
          </span>
        </div>
      </Link>
    </InteractiveCard>
  );
};
