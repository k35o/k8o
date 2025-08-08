import { cn } from '@k8o/helpers/cn';
import { isInternalRoute } from '@k8o/helpers/is-internal-route';
import type { FC, PropsWithChildren, ReactNode } from 'react';

type IconLinkProps = PropsWithChildren<{
  size?: 'sm' | 'md' | 'lg';
  bg?: 'transparent' | 'base';
  label?: string;
  href: string;
  openInNewTab?: boolean;
  renderAnchor?: (props: {
    href: string;
    className: string;
    target?: string;
    rel?: string;
    children: ReactNode;
  }) => ReactNode;
}>;

export const IconLink: FC<IconLinkProps> = ({
  size = 'md',
  bg = 'transparent',
  label,
  href,
  children,
  openInNewTab = false,
  renderAnchor = ({ children, ...props }) => <a {...props}>{children}</a>,
}) => {
  const type = isInternalRoute(href) && !openInNewTab ? 'internal' : 'external';
  const props =
    type === 'internal'
      ? {}
      : {
          target: '_blank',
          rel: 'noopener noreferrer',
        };
  return renderAnchor({
    href,
    className: cn(
      'inline-flex rounded-full hover:bg-bg-subtle active:bg-bg-emphasize focus-visible:ring-2 focus-visible:ring-border-info',
      bg === 'base' && 'bg-bg-base/90',
      bg === 'transparent' && 'bg-transparent',
      size === 'sm' && 'p-1',
      size === 'md' && 'p-2',
      size === 'lg' && 'p-3',
    ),
    ...props,
    children: (
      <>
        <span className="sr-only">{label}</span>
        {children}
      </>
    ),
  });
};
