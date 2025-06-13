import { ExternalLinkIcon } from '../icons';
import { isInternalRoute } from '@/helpers/is-internal-route';
import Link from 'next/link';
import { ReactNode } from 'react';

export const Anchor = ({
  href,
  children,
  openInNewTab = false,
}: {
  href: string;
  children: ReactNode;
  openInNewTab?: boolean;
}) => {
  return isInternalRoute(href) && !openInNewTab ? (
    <Link
      href={href}
      className="text-fg-info cursor-pointer hover:underline"
    >
      {children}
    </Link>
  ) : (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-fg-info inline-flex cursor-pointer items-center gap-0.5 hover:underline"
    >
      {children}
      <ExternalLinkIcon size="sm" />
    </a>
  );
};
