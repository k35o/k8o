import { Header } from './header';
import { ColorFilters } from '../color-filters';
import { ContactToMe } from '../contact-to-me';
import { ToggleTheme } from '../toggle-theme';
import { LlmLink } from './llm-link';
import { NavigationMenu } from './navigation-menu';
import { NewsLink } from './news-link';
import { TagsLink } from './tags-link';
import { Logo } from '@k8o/arte-odyssey/icons';
import { formatDate } from '@k8o/helpers/date';
import Link from 'next/link';
import { FC, ReactNode } from 'react';

export const GlobalLayout: FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <div className="app-background flex min-h-svh flex-col">
      <Header>
        <div className="flex items-center gap-3">
          <Link href="/">
            <h1>
              <span className="sr-only">k8o</span>
              <Logo className="h-10" />
            </h1>
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            <TagsLink />
            <NewsLink />
            <ContactToMe />
          </div>
        </div>
        <div className="hidden items-center gap-1 md:flex">
          <LlmLink />
          <ColorFilters.ListBox />
          <div className="-my-2">
            <ToggleTheme />
          </div>
        </div>
        <div className="block md:hidden">
          <NavigationMenu />
        </div>
      </Header>
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
