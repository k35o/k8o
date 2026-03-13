import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'k8o Admin',
  description: 'k8o 管理サイト',
} satisfies Metadata;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-bg-base text-fg-base antialiased">
        <header className="border-border-base border-b px-6 py-4">
          <h1 className="font-bold text-lg">k8o Admin</h1>
        </header>
        <main className="px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
