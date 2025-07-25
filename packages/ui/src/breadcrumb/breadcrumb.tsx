import { ChevronIcon } from '../icons';
import { cn } from '@k8o/helpers/cn';
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
          size === 'md' && 'md:text-md text-xs',
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
      <ChevronIcon size="sm" direction="right" />
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
    <Link
      href={href}
      className="text-fg-mute hover:text-fg-base underline"
    >
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
