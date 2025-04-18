import { ColorFilters } from '../color-filters';
import { ContactToMe } from '../contact-to-me';
import { NewsLink } from './news-link';
import { ToggleTheme } from '../toggle-theme';
import { NavigationMenu } from './navigation-menu';
import { Heading } from '@/components/heading';
import Link from 'next/link';
import { FC, ReactNode } from 'react';

export const GlobalLayout: FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <div className="app-background flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex items-center justify-center p-4">
        <div className="bg-bg-base/60 flex w-full max-w-5xl items-center justify-between rounded-full px-8 py-2 shadow-md backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Heading type="h1">k8o</Heading>
            </Link>
            <div className="hidden items-center gap-2 sm:flex">
              <NewsLink />
              <ContactToMe />
            </div>
          </div>
          <div className="hidden items-center gap-4 sm:flex">
            <ColorFilters.ListBox />
            <div className="-my-2">
              <ToggleTheme />
            </div>
          </div>
          <div className="block sm:hidden">
            <NavigationMenu />
          </div>
        </div>
      </header>
      <main className="flex grow justify-center">
        <div className="w-full max-w-5xl px-4 py-10">{children}</div>
      </main>
    </div>
  );
};
