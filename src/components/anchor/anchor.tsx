import { isInternalRoute } from '@/utils/is-internal-route';
import Link from 'next/link';
import { ReactNode } from 'react';

export const Anchor = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => {
  return (
    <>
      {isInternalRoute(href) ? (
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
          className="text-fg-info cursor-pointer hover:underline"
        >
          {children}
        </a>
      )}
    </>
  );
};
