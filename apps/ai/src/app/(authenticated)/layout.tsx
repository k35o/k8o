import type { ReactNode } from 'react';

import { verifySession } from '@/shared/auth/verify-session';

export default async function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  await verifySession();

  return (
    <div className="bg-bg-surface flex min-h-dvh flex-col lg:h-dvh">
      <main className="mx-auto flex w-full max-w-400 flex-1 flex-col p-6 md:px-10 lg:min-h-0">
        {children}
      </main>
    </div>
  );
}
