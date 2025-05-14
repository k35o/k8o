import { ColorFilters } from '../color-filters';
import { ContactToMe } from '../contact-to-me';
import { NewsLink } from './news-link';
import { ToggleTheme } from '../toggle-theme';
import { NavigationMenu } from './navigation-menu';
import { TagsLink } from './tags-link';
import { Logo } from '@/components/icons/logo';
import { formatDate } from '@/utils/date/format';
import Link from 'next/link';
import { FC, ReactNode } from 'react';

export const GlobalLayout: FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <div className="app-background flex min-h-svh flex-col">
      <header className="sticky top-0 z-50 flex items-center justify-center p-4">
        <div className="bg-bg-base/60 flex w-full max-w-5xl items-center justify-between rounded-full px-8 py-2 shadow-md backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Link href="/">
              <h1>
                <span className="sr-only">k8o</span>
                <Logo className="h-10" />
              </h1>
            </Link>
            <div className="hidden items-center gap-2 md:flex">
              <NewsLink />
              <ContactToMe />
              <TagsLink />
            </div>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <ColorFilters.ListBox />
            <div className="-my-2">
              <ToggleTheme />
            </div>
          </div>
          <div className="block md:hidden">
            <NavigationMenu />
          </div>
        </div>
      </header>
      <main className="flex grow justify-center">
        <div className="w-full max-w-5xl p-4 pt-10">{children}</div>
      </main>
      <footer className="flex items-center justify-center p-4">
        <div className="max-w-5xl">
          <p className="text-fg-mute md:text-lg">
            ©︎ 2024〜{formatDate(new Date(), 'yyyy')} k8o. All Rights
            Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
