import { Anchor, Badge, Heading } from '@k8o/arte-odyssey';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  getPlaygroundSection,
  Playground,
  playgroundCategoryLabels,
  playgroundSections,
} from '@/app/_components/playgrounds';

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

  return {
    title: section.title,
    description: section.description,
    openGraph: {
      title: section.title,
      description: section.description,
      url: `https://k8o.me/playgrounds/${section.id}`,
      siteName: 'k8o',
      locale: 'ja',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: section.title,
      description: section.description,
    },
  };
}

export default async function PlaygroundSectionPage({
  params,
}: PageProperties) {
  const { id } = await params;
  const section = getPlaygroundSection(id);
  if (!section) {
    notFound();
  }

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
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge size="sm" text={playgroundCategoryLabels[section.category]} />
          <span className="text-fg-mute text-sm">
            デモ{section.demos.length}件
          </span>
        </div>
        <Heading type="h1">{section.title}</Heading>
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
    </div>
  );
}
