import { Logo } from '@k8ordo/ui';
import type { BrowserMinVersions } from '@repo/helpers/browser/detect-browser';
import Link from 'next/link';
import type { FC, ReactNode } from 'react';

import { BrowserSupportNotice } from '../browser-support-notice';
import { Background } from './background';
import { Footer } from './footer';
import { Header } from './header';
import { HeaderActions } from './header-actions';

import styles from './global-layout.module.css';

const EMPTY_MIN_VERSIONS: BrowserMinVersions = {};

export const GlobalLayout: FC<{
  children: ReactNode;
  minVersions?: BrowserMinVersions;
}> = ({ children, minVersions = EMPTY_MIN_VERSIONS }) => (
  <div className={styles.root}>
    <Background />
    <BrowserSupportNotice minVersions={minVersions} />
    <Header>
      <Link href="/">
        <h1>
          <span className={styles.srOnly}>k8o</span>
          <Logo className={styles.logo} />
        </h1>
      </Link>
      <HeaderActions />
    </Header>
    <main className={styles.main}>{children}</main>
    <Footer />
  </div>
);
