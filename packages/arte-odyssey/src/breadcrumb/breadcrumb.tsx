import { cn } from '@k8o/helpers/cn';
import type { FC, PropsWithChildren } from 'react';
import { ChevronIcon } from '../icons';

const List: FC<
  PropsWithChildren<{
    size?: 'sm' | 'md' | 'lg';
  }>
> = ({ children, size = 'md' }) => {
  return (
    <nav aria-label="パンクズリスト">
      <ol
        className={cn(
          'flex list-none items-center gap-1 font-bold text-fg-mute',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-xs md:text-md',
          size === 'lg' && 'text-xl md:text-2xl',
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
      <ChevronIcon direction="right" size="sm" />
    </li>
  );
};

const _Link: FC<
  PropsWithChildren<{
    href: string;
    current?: boolean;
    component?: FC<{ href: string; className: string }>;
  }>
> = ({ href, current = false, children, component }) => {
  const Link = component ?? 'a';
  return current ? (
    <span className="text-fg-base">{children}</span>
  ) : (
    <Link className="text-fg-mute underline hover:text-fg-base" href={href}>
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
