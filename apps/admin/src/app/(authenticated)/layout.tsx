import type { ReactNode } from 'react';

import { AdminSidebar } from '@/app/(authenticated)/_components/admin-sidebar';

export default function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="bg-bg-surface flex min-h-dvh flex-col md:flex-row">
      <AdminSidebar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 md:px-10">
        {children}
      </main>
    </div>
  );
}
