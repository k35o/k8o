import { Anchor, Badge, Heading } from '@k8o/arte-odyssey';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import {
  getPlaygroundSection,
  Playground,
  playgroundCategoryLabels,
  playgroundSections,
} from '@/app/_components/playgrounds';
import { buildPageMetadata } from '@/shared/site/build-page-metadata';

import { BlogLinkButton } from './_components/blog-link-button';

export function generateStaticParams() {
  return playgroundSections.map((section) => ({ id: section.id }));
}

type PageProperties = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProperties): Promise<Metadata> {
  const { id } = await params;
  const section = getPlaygroundSection(id);
  if (!section) {
    notFound();
  }

  return buildPageMetadata({
    title: section.title,
    description: section.description,
    path: `/playgrounds/${section.id}`,
    twitterCard: 'summary_large_image',
  });
}

async function PlaygroundSectionContent({ params }: PageProperties) {
  const { id } = await params;
  const section = getPlaygroundSection(id);
  if (!section) {
    notFound();
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge size="sm" label={playgroundCategoryLabels[section.category]} />
          <span className="text-fg-mute text-sm">
            デモ{section.demos.length}件
          </span>
        </div>
        <Heading level="h1">{section.title}</Heading>
        <p className="text-fg-mute leading-relaxed">{section.description}</p>
        {section.type === 'blog' && (
          <div className="flex">
            <BlogLinkButton slug={section.slug} />
          </div>
        )}
      </div>
      <div>
        {section.demos.map((demo) => {
          const DemoComponent = demo.component;
          return (
            <Playground
              description={demo.description}
              key={demo.title}
              title={demo.title}
            >
              <DemoComponent />
            </Playground>
          );
        })}
      </div>
    </>
  );
}

function PlaygroundSectionSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-bg-mute h-5 w-16 rounded-full" />
        <div className="bg-bg-mute h-4 w-16 rounded-md" />
      </div>
      <div className="bg-bg-mute h-9 w-64 rounded-md" />
      <div className="bg-bg-mute h-5 w-full max-w-xl rounded-md" />
    </div>
  );
}

// params に依存する描画を Suspense 配下へ隔離し、App Shell を URL 非依存に保つ
export default function PlaygroundSectionPage({ params }: PageProperties) {
  return (
    <div className="flex flex-col gap-8">
      <Anchor
        href="/playgrounds"
        renderAnchor={({ className, href, children }) => (
          <Link className={className} href={href}>
            {children}
          </Link>
        )}
      >
        ← Playgrounds一覧に戻る
      </Anchor>
      <Suspense fallback={<PlaygroundSectionSkeleton />}>
        <PlaygroundSectionContent params={params} />
      </Suspense>
    </div>
  );
}
