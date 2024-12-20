import Link from 'next/link';
import { FC, ReactNode } from 'react';
import { Heading } from '../../../components/heading';
import { ToggleTheme } from '../toggle-theme';
import { ColorFilters } from '../color-filters';

export const GlobalLayout: FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <div className="app-background flex min-h-screen flex-col">
      <header className="flex items-center justify-center p-4">
        <div className="flex w-full max-w-4xl items-center justify-between px-4">
          <Link href="/">
            <Heading type="h1">k8o</Heading>
          </Link>
          <div className="flex items-center gap-4">
            <ColorFilters.ListBox />
            <div className="-my-2">
              <ToggleTheme />
            </div>
          </div>
        </div>
      </header>
      <main className="flex grow justify-center">
        <div className="w-full max-w-4xl px-4 py-10">{children}</div>
      </main>
    </div>
  );
};
