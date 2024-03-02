import Link from 'next/link';
import { FC, ReactNode } from 'react';
import { Heading } from '../heading';
import { GithubMark } from '../icons';
import { Anchor } from '../anchor';

export const GlobalLayout: FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-center p-4">
        <div className="flex w-full max-w-4xl items-center justify-between px-4">
          <Link href="/">
            <Heading type="h1">k8o</Heading>
          </Link>
          <Anchor href="https://github.com/k35o/k8o">
            <GithubMark className="h-8 w-8" />
          </Anchor>
        </div>
      </header>
      <main className="flex grow justify-center bg-bgBase">
        <div className="w-full max-w-4xl px-4 py-10">{children}</div>
      </main>
    </div>
  );
};
