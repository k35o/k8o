import type { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <main className="px-6 py-8">{children}</main>;
}
