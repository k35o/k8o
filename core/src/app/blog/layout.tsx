import { ExternalBlog } from './_components/external-blog';
import {
  ToggleWritingMode,
  WritingModeProvider,
} from './_components/toggle-writing-mode';
import { Heading } from '../../components/heading';
import Link from 'next/link';
import { PropsWithChildren } from 'react';

export const metadata = {
  title: 'Blog',
  description:
    'k8oのブログです。ジャンルを問わず、身の回りのことを書きます。',
  openGraph: {
    title: 'Blog',
    description:
      'k8oのブログです。ジャンルを問わず、身の回りのことを書きます。',
    url: 'https://k8o.me/blog',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'Blog',
    card: 'summary',
    description:
      'k8oのブログです。ジャンルを問わず、身の回りのことを書きます。',
  },
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      {/* Get the latest one from: https://katex.org/docs/browser */}
      <link
        href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
        rel="stylesheet"
      />
      <WritingModeProvider>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/blog" className="hover:underline">
                <Heading type="h2">Blog</Heading>
              </Link>
              <ToggleWritingMode />
            </div>
            <ExternalBlog />
          </div>
          {children}
        </div>
      </WritingModeProvider>
    </>
  );
}
