import { Logo } from '@k8o/arte-odyssey';
import Link from 'next/link';
import { type FC, type ReactNode, Suspense } from 'react';
import { ContactToMe } from '../contact-to-me';
import { ToggleTheme } from '../toggle-theme';
import { Background } from './background';
import { Footer } from './footer';
import { Header } from './header';
import { LlmLink } from './llm-link';

export const GlobalLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-svh flex-col">
      <Background />
      <Header>
        <Link href="/">
          <h1>
            <span className="sr-only">k8o</span>
            <Logo className="h-10" />
          </h1>
        </Link>
        <div className="flex items-center gap-1">
          <Suspense fallback={null}>
            <ContactToMe />
          </Suspense>
          <ToggleTheme />
          <LlmLink />
        </div>
      </Header>
      <main className="flex grow justify-center">
        <div className="w-full max-w-5xl p-4 pt-10">{children}</div>
      </main>
      <Suspense
        fallback={
          <footer className="flex items-center justify-center p-4">
            <div className="max-w-5xl">
              <p className="text-fg-mute md:text-lg">
                ©︎ 2024〜2026 k8o. All Rights Reserved.
              </p>
            </div>
          </footer>
        }
      >
        <Footer />
      </Suspense>
    </div>
  );
};
