import { Heading } from '@k8o/arte-odyssey';
import { Suspense } from 'react';

import { playgroundSections } from '@/app/_components/playgrounds';

import {
  PlaygroundsListContent,
  PlaygroundsListSkeleton,
} from './_components/playgrounds-list-content';
import type { PlaygroundSummary } from './_utils/types';

const playgroundSummaries: PlaygroundSummary[] = playgroundSections
  .map((section) => ({
    id: section.id,
    title: section.title,
    description: section.description,
    category: section.category,
    demoCount: section.demos.length,
    demoTexts: section.demos.flatMap((demo) => [demo.title, demo.description]),
    hasBlog: section.type === 'blog',
  }))
  .toSorted((a, b) => a.title.localeCompare(b.title, 'ja'));

export default function PlaygroundsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Heading type="h1">Playgrounds</Heading>
        <p className="text-fg-mute leading-relaxed">
          ブログ記事や興味のある技術の試作品を集めています。気になるものを選ぶと、実際に動かせるデモページが開きます。
        </p>
      </div>
      <Suspense fallback={<PlaygroundsListSkeleton />}>
        <PlaygroundsListContent playgrounds={playgroundSummaries} />
      </Suspense>
    </div>
  );
}
