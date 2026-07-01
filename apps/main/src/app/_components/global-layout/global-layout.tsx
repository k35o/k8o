import { Logo } from '@k8o/arte-odyssey';
import type { BaselineMinVersions } from '@repo/helpers/browser/detect-browser';
import Link from 'next/link';
import { type FC, type ReactNode, Suspense } from 'react';

import { BrowserBaselineNotice } from '../browser-baseline-notice';
import { Background } from './background';
import { Footer } from './footer';
import { Header } from './header';
import { HeaderActions } from './header-actions';

const EMPTY_MIN_VERSIONS: BaselineMinVersions = {};

export const GlobalLayout: FC<{
  children: ReactNode;
  minVersions?: BaselineMinVersions;
}> = ({ children, minVersions = EMPTY_MIN_VERSIONS }) => (
  <div className="flex min-h-svh flex-col">
    <Background />
    <BrowserBaselineNotice minVersions={minVersions} />
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
    <Suspense
      fallback={
        <footer className="flex items-center justify-center p-4">
          <p className="text-fg-mute md:text-lg">
            ©︎ 2024〜2026 k8o. All Rights Reserved.
          </p>
        </footer>
      }
    >
      <Footer />
    </Suspense>
  </div>
);
