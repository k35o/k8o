import type { Metadata } from 'next';
import { Suspense } from 'react';

import { getSlideContent } from '@/features/slides/interface/queries';

const slug = 'sample-deck';

export async function generateMetadata(): Promise<Metadata> {
  const slide = await getSlideContent(slug);
  return {
    title: slide.title,
    description: slide.description,
    openGraph: {
      title: slide.title,
      description: slide.description ?? undefined,
      url: `https://k8o.me/slides/${slug}`,
      publishedTime: slide.createdAt,
      authors: ['k8o'],
      siteName: 'k8o',
      locale: 'ja',
      type: 'article',
    },
    twitter: {
      title: slide.title,
      card: 'summary_large_image',
      description: slide.description ?? undefined,
    },
  };
}

export default function Layout({
  children,
}: LayoutProps<'/slides/sample-deck'>) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
