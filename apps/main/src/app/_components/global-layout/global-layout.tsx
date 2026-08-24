import { Logo } from '@k8o/arte-odyssey';
import type { BrowserMinVersions } from '@repo/helpers/browser/detect-browser';
import Link from 'next/link';
import type { FC, ReactNode } from 'react';

import { BrowserSupportNotice } from '../browser-support-notice';
import { Background } from './background';
import { Footer } from './footer';
import { Header } from './header';
import { HeaderActions } from './header-actions';

const EMPTY_MIN_VERSIONS: BrowserMinVersions = {};

export const GlobalLayout: FC<{
  children: ReactNode;
  minVersions?: BrowserMinVersions;
}> = ({ children, minVersions = EMPTY_MIN_VERSIONS }) => (
  <div className="flex min-h-svh flex-col">
    <Background />
    <BrowserSupportNotice minVersions={minVersions} />
    <Header>
      <Link href="/">
        <h1>
          <span className="sr-only">k8o</span>
          <Logo className="h-10" />
        </h1>
      </Link>
      <HeaderActions />
    </Header>
    <main className="flex grow justify-center px-4 pt-10 pb-4">{children}</main>
    <Footer />
  </div>
);
