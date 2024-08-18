import { cn } from '@/utils/cn';
import { FC, PropsWithChildren } from 'react';

type IconLinkProps = PropsWithChildren<{
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  href: string;
}>;

export const IconLink: FC<IconLinkProps> = ({
  size = 'md',
  label,
  href,
  children,
}) => {
  return (
    <a
      className={cn(
        'bg-transparent block rounded-full bg-white hover:bg-grayHover focus-visible:ring-2 focus-visible:ring-focusRing active:bg-grayActive',
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
