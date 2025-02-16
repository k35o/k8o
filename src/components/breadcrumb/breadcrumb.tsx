import { cn } from '@/utils/cn';
import { ChevronRight } from 'lucide-react';
import { Route } from 'next';
import Link from 'next/link';
import { FC, PropsWithChildren } from 'react';

const List: FC<
  PropsWithChildren<{
    size?: 'sm' | 'md' | 'lg';
  }>
> = ({ children, size = 'md' }) => {
  return (
    <nav aria-label="パンクズリスト">
      <ol
        className={cn(
          'text-fg-mute flex list-none items-center gap-1 font-bold',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-2xl',
        )}
      >
        {children}
      </ol>
    </nav>
  );
};

const Item: FC<PropsWithChildren> = ({ children }) => {
  return <li className="inline-flex items-center">{children}</li>;
};

const Separator: FC = () => {
  return (
    <li className="text-fg-mute">
      <ChevronRight className="size-4" />
    </li>
  );
};

const _Link: FC<
  PropsWithChildren<{ href: Route; current?: boolean }>
> = ({ href, current = false, children }) => {
  return current ? (
    <span className="text-fg-base">{children}</span>
  ) : (
    <Link href={href} className="hover:text-fg-base hover:underline">
      {children}
    </Link>
  );
};

export const Breadcrumb = {
  List,
  Item,
  Separator,
  Link: _Link,
};
