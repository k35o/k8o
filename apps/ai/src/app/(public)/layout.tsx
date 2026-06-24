import type { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <main className="bg-bg-surface flex min-h-dvh items-center justify-center px-6 py-10">
      {children}
    </main>
  );
}
