import { cn } from '@repo/helpers/cn';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppProvider } from './_providers/app';
import './_styles/globals.css';
import { mPlus2, notoSansJp } from './_styles/font';

export const metadata = {
  title: 'k8o Admin',
  description: 'k8o 管理サイト',
} satisfies Metadata;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={cn(
          mPlus2.variable,
          notoSansJp.variable,
          'bg-bg-surface font-m-plus-2 font-medium text-fg-base antialiased',
        )}
      >
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
