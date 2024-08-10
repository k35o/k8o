import { cn } from '@/utils/cn';
import { isInternalRoute } from '@/utils/is-internal-route';
import Link from 'next/link';
import { FC, PropsWithChildren, ReactNode } from 'react';

export const LinkButton: FC<
  PropsWithChildren<{
    size?: 'sm' | 'md' | 'lg';
    href: string;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
  }>
> = ({ children, size = 'md', href, startIcon, endIcon }) => {
  const className = cn(
    'rounded-xl font-bold',
    'bg-primary text-white hover:bg-primaryHover active:bg-primaryActive',
    'focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focusRing',
    size === 'sm' && 'px-3 py-1 text-sm',
    size === 'md' && 'text-md px-4 py-2',
    size === 'lg' && 'px-6 py-3 text-lg',
    Boolean(startIcon || endIcon) &&
      'inline-flex items-center justify-between gap-2',
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
