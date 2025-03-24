import { cn } from '@/utils/cn';
import { isInternalRoute } from '@/utils/is-internal-route';
import Link from 'next/link';
import { FC, PropsWithChildren, ReactNode } from 'react';

export const LinkButton: FC<
  PropsWithChildren<{
    variant?: 'contained' | 'outlined';
    size?: 'sm' | 'md' | 'lg';
    href: string;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
  }>
> = ({
  children,
  size = 'md',
  variant = 'contained',
  href,
  startIcon,
  endIcon,
}) => {
  const className = cn(
    'rounded-lg text-center font-bold',
    {
      ['bg-primary-bg text-fg hover:bg-primary-bg/90 active:bg-primary-bg/80']:
        variant === 'contained',
      ['border-primary-border bg-bg-base text-primary-fg hover:bg-bg-subtle active:bg-bg-emphasize border-2']:
        variant === 'outlined',
    },
    'focus-visible:bordertransparent focus-visible:ring-border-info focus-visible:ring-2 focus-visible:outline-hidden',
    size === 'sm' && 'px-3 py-1 text-sm',
    size === 'md' && 'text-md px-4 py-2',
    size === 'lg' && 'px-6 py-3 text-lg',
    Boolean(startIcon ?? endIcon) &&
      'flex items-center gap-2',
  );
  return isInternalRoute(href) ? (
    <Link className={className} href={href}>
      {startIcon}
      {children}
      {endIcon}
    </Link>
  ) : (
    <a className={className} href={href}>
      {startIcon}
      {children}
      {endIcon}
    </a>
  );
};
