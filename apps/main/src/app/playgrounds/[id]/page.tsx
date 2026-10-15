import { Anchor, Badge, Heading } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
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

import styles from './page.module.css';

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
      <div className={styles.header}>
        <div className={styles.meta}>
          <Badge size="sm" label={playgroundCategoryLabels[section.category]} />
          <span className={styles.count}>デモ{section.demos.length}件</span>
        </div>
        <Heading level="h1">{section.title}</Heading>
        <p className={styles.description}>{section.description}</p>
        {section.type === 'blog' && (
          <div className={styles.blogLink}>
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
    <div className={styles.skeleton}>
      <div className={styles.meta}>
        <div className={cn(styles.bone, styles.skeletonBadge)} />
        <div className={cn(styles.bone, styles.skeletonCount)} />
      </div>
      <div className={cn(styles.bone, styles.skeletonTitle)} />
      <div className={cn(styles.bone, styles.skeletonDescription)} />
    </div>
  );
}

// params に依存する描画を Suspense 配下へ隔離し、App Shell を URL 非依存に保つ
export default function PlaygroundSectionPage({ params }: PageProperties) {
  return (
    <div className={styles.root}>
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
