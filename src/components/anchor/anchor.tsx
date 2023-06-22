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
  const Component = isExternal ? 'a' : Link;
  return (
    <Component
      className="cursor-pointer text-blue-600 hover:underline"
      // TODO: 手動キャストせずに判別できる方法が出たら直す
      href={href as Route}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
    >
      {children}
    </Component>
  );
};
