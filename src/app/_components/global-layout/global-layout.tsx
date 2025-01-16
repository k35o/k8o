import Link from 'next/link';
import { FC, ReactNode } from 'react';
import { Heading } from '@/components/heading';
import { IconLink } from '@/components/icon-link';
import { ToggleTheme } from '../toggle-theme';
import { ColorFilters } from '../color-filters';
import { Bell } from 'lucide-react';
import { ContactToMe } from '../contact-to-me';

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
            <ContactToMe />
            <IconLink href="/news">
              <span className="sr-only">お知らせ</span>
              <Bell className="size-8" />
            </IconLink>
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
