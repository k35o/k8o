import { cn } from '@repo/helpers/cn';
import type { Metadata } from 'next';
import { type ReactNode, Suspense } from 'react';
import { AdminHeader } from './_components/admin-header';
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
          'bg-bg-base font-m-plus-2 font-medium text-fg-base antialiased',
        )}
      >
        <AppProvider>
          <Suspense>
            <AdminHeader />
          </Suspense>
          <main className="px-6 py-8">{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
