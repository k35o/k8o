import { isInternalRoute } from '@k8o/helpers/is-internal-route';
import type { ReactNode } from 'react';
import { ExternalLinkIcon } from '../icons';

export const Anchor = ({
  href,
  children,
  openInNewTab = false,
  renderAnchor = ({ children, ...props }) => <a {...props}>{children}</a>,
}: {
  href: string;
  children: ReactNode;
  openInNewTab?: boolean;
  renderAnchor?: (props: {
    type: 'internal' | 'external';
    href: string;
    className: string;
    target?: string;
    rel?: string;
    children: ReactNode;
  }) => ReactNode;
}) => {
  const type = isInternalRoute(href) && !openInNewTab ? 'internal' : 'external';
  const props =
    type === 'internal'
      ? {
          className: 'text-fg-info cursor-pointer underline',
          children,
        }
      : {
          className:
            'text-fg-info inline-flex cursor-pointer items-center gap-0.5 underline',
          target: '_blank',
          rel: 'noopener noreferrer',
          children: (
            <>
              {children}
              <ExternalLinkIcon size="sm" />
            </>
          ),
        };
  return renderAnchor({
    type,
    href,
    ...props,
  });
};
