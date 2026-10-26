import { href } from '@k8ordo/framework';
import { Logo } from '@k8ordo/ui';
import type { BrowserMinVersions } from '@repo/helpers/browser/detect-browser';
import type { FC, ReactNode } from 'react';

import { BrowserSupportNotice } from '../browser-support-notice/browser-support-notice';
import { Background } from './background/background';
import { Footer } from './footer/footer';
import { HeaderActions } from './header-actions/header-actions';
import { Header } from './header/header';

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
      <a href={href('/')}>
        <h1>
          <span className={styles.srOnly}>k8o</span>
          <Logo className={styles.logo} />
        </h1>
      </a>
      <HeaderActions />
    </Header>
    <main className={styles.main}>{children}</main>
    <Footer />
  </div>
);
