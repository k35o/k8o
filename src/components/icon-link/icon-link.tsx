import { isInternalRoute } from '@/utils/is-internal-route';
import { cn } from '@/utils/cn';
import { FC, PropsWithChildren } from 'react';
import Link from 'next/link';

type IconLinkProps = PropsWithChildren<{
  size?: 'sm' | 'md' | 'lg';
  bg?: 'transparent' | 'base';
  label?: string;
  href: string;
}>;

export const IconLink: FC<IconLinkProps> = ({
  size = 'md',
  bg = 'transparent',
  label,
  href,
  children,
}) => {
  return isInternalRoute(href) ? (
    <Link
      className={cn(
        'hover:bg-bg-subtle focus-visible:ring-border-info active:bg-bg-emphasize block rounded-full focus-visible:ring-2',
        bg === 'base' && 'bg-bg-base/55',
        bg === 'transparent' && 'bgtransparent',
        size === 'sm' && 'p-1',
        size === 'md' && 'p-2',
        size === 'lg' && 'p-3',
      )}
      href={href}
      aria-label={label}
    >
      {children}
    </Link>
  ) : (
    <a
      className={cn(
        'hover:bg-bg-subtle focus-visible:ring-border-info active:bg-bg-emphasize block rounded-full focus-visible:ring-2',
        bg === 'base' && 'bg-bg-base/55',
        bg === 'transparent' && 'bgtransparent',
        size === 'sm' && 'p-1',
        size === 'md' && 'p-2',
        size === 'lg' && 'p-3',
      )}
      target="_blank"
      rel="noopener noreferrer"
      href={href}
      aria-label={label}
    >
      {children}
    </a>
  );
};
