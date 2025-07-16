import { cn } from '@k8o/helpers/cn';
import { isInternalRoute } from '@k8o/helpers/is-internal-route';
import { Route } from 'next';
import Link from 'next/link';
import { FC, PropsWithChildren } from 'react';

type IconLinkProps = PropsWithChildren<{
  size?: 'sm' | 'md' | 'lg';
  bg?: 'transparent' | 'base';
  label?: string;
  href: string;
  openInNewTab?: boolean;
  prefetch?: boolean;
}>;

export const IconLink: FC<IconLinkProps> = ({
  size = 'md',
  bg = 'transparent',
  label,
  href,
  children,
  openInNewTab = false,
  ...linkProps
}) => {
  return isInternalRoute<Route>(href) && !openInNewTab ? (
    <Link
      className={cn(
        'hover:bg-bg-subtle focus-visible:ring-border-info active:bg-bg-emphasize block rounded-full focus-visible:ring-2',
        bg === 'base' && 'bg-bg-base/90',
        bg === 'transparent' && 'bg-transparent',
        size === 'sm' && 'p-1',
        size === 'md' && 'p-2',
        size === 'lg' && 'p-3',
      )}
      href={href}
      {...linkProps}
    >
      <span className="sr-only">{label}</span>
      {children}
    </Link>
  ) : (
    <a
      className={cn(
        'hover:bg-bg-subtle focus-visible:ring-border-info active:bg-bg-emphasize block rounded-full focus-visible:ring-2',
        bg === 'base' && 'bg-bg-base/90',
        bg === 'transparent' && 'bg-transparent',
        size === 'sm' && 'p-1',
        size === 'md' && 'p-2',
        size === 'lg' && 'p-3',
      )}
      target="_blank"
      rel="noopener noreferrer"
      href={href}
    >
      <span className="sr-only">{label}</span>
      {children}
    </a>
  );
};
