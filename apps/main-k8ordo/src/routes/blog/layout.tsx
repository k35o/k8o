import type { ReactNode } from 'react';

import { WritingModeProvider } from '@/components/blog/blog-layout/writing-mode/writing-mode-context';

import '@/components/blog/vertical-inline-code.css';

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <WritingModeProvider>{children}</WritingModeProvider>;
}
