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
        'block rounded-full hover:bg-bgHover focus-visible:ring-2 focus-visible:ring-borderFocus active:bg-bgActive',
        bg === 'base' && 'bg-bgBase/55',
        bg === 'transparent' && 'bg-bgTransparent',
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
        'block rounded-full hover:bg-bgHover focus-visible:ring-2 focus-visible:ring-borderFocus active:bg-bgActive',
        bg === 'base' && 'bg-bgBase/55',
        bg === 'transparent' && 'bg-bgTransparent',
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
