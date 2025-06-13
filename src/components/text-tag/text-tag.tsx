import { cn } from '@/helpers/cn';
import { Route } from 'next';
import Link from 'next/link';

export const TextTag = ({
  text,
  size = 'md',
  href,
}: {
  text: string;
  size?: 'sm' | 'md';
  href?: Route;
}) => {
  if (href) {
    return (
      <Link href={href}>
        <span
          className={cn(
            'bg-bg-mute hover:bg-bg-emphasize inline-block rounded-full font-medium',
            size === 'sm' && 'px-2 py-0.5 text-xs',
            size === 'md' && 'px-3 py-1 text-sm',
          )}
        >
          {text}
        </span>
      </Link>
    );
  }

  return (
    <span
      className={cn(
        'bg-bg-mute inline-block rounded-full font-medium',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
      )}
    >
      {text}
    </span>
  );
};
