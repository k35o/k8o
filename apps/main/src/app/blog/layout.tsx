import { buildPageMetadata } from '@/shared/site/build-page-metadata';

import { WritingModeProvider } from './_components/blog-layout/writing-mode';

import './_styles/vertical-inline-code.css';
import { ScrollToTopOnPathChange } from './_components/scroll-to-top-on-path-change';

export const metadata = buildPageMetadata({
  title: 'Blog',
  description: 'Webフロントエンドを中心に、日々のことも書いています。',
  path: '/blog',
  rssFeedPath: '/blog/feed',
});

export default function Layout({ children }: LayoutProps<'/blog'>) {
  return (
    <>
      <ScrollToTopOnPathChange />
      <WritingModeProvider>{children}</WritingModeProvider>
    </>
  );
}
