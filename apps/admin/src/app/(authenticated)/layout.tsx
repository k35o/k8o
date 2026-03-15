import type { ReactNode } from 'react';
import { AdminHeader } from '@/app/(authenticated)/_components/admin-header';

export default function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <AdminHeader />
      <main className="px-6 py-8">{children}</main>
    </>
  );
}
