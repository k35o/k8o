import { Route } from 'next';
import Link from 'next/link';
import { ReactNode } from 'react';

export const Anchor = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => {
  const isExternal = href.startsWith('http');
  return (
    <>
      {isExternal ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer text-blue-600 hover:underline"
        >
          {children}
        </a>
      ) : (
        <Link
          href={href as Route}
          className="cursor-pointer text-blue-600 hover:underline"
        >
          {children}
        </Link>
      )}
    </>
  );
};
