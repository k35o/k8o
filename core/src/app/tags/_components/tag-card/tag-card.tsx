import { InteractiveCard } from '@k8o/arte-odyssey/card';
import { ChevronIcon } from '@k8o/arte-odyssey/icons';
import { Separator } from '@k8o/arte-odyssey/separator';
import { cn } from '@k8o/helpers/cn';
import Link from 'next/link';
import { FC } from 'react';

export const TagCard: FC<{
  title: string;
  href: string;
  count?: number;
  label: string;
  linkLabel: string;
}> = ({ title, href, count, label, linkLabel }) => {
  return (
    <InteractiveCard width="fit">
      <Link
        href={href}
        aria-label={linkLabel}
        className={cn(
          'flex h-full w-70 flex-col gap-2 rounded-lg border border-transparent p-4',
          'group',
          'hover:bg-primary-bg-mute hover:text-primary-fg hover:border-primary-border',
        )}
      >
        <div className="flex w-full basis-full items-center justify-between">
          <span className="text-lg font-bold">{title}</span>
          {count && (
            <span className="bg-primary-bg text-primary-fg min-w-8 rounded-full px-2 py-1 text-center">
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
