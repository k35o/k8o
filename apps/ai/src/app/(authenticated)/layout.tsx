import type { ReactNode } from 'react';

import { verifySession } from '@/shared/auth/verify-session';

import { ToggleTheme } from './_components/toggle-theme';

export default async function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  await verifySession();

  return (
    <div className="bg-bg-surface flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-end px-6 pt-6 md:px-10">
        <ToggleTheme />
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pt-4 pb-10 md:px-10">
        {children}
      </main>
    </div>
  );
}
