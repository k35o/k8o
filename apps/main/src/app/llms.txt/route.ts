import { NextResponse } from 'next/server';
import { metadata as baseConverterMetadata } from '@/app/base-converter/layout';
import { getBlogContents } from '@/app/blog/_api';
import { metadata as blogMetadata } from '@/app/blog/layout';
import { metadata as colorConverterMetadata } from '@/app/color-converter/layout';
import { metadata as contrastCheckerMetadata } from '@/app/contrast-checker/layout';
import { metadata as japaneseTextFixerMetadata } from '@/app/japanese-text-fixer/layout';
import { metadata as mojiCountMetadata } from '@/app/moji-count/layout';
import { metadata as playgroundsMetadata } from '@/app/playgrounds/layout';
import { metadata as qrGeneratorMetadata } from '@/app/qr-generator/layout';
import { metadata as quizzesMetadata } from '@/app/quizzes/layout';
import { metadata as radiusMakerMetadata } from '@/app/radius-maker/layout';
import { metadata as sqlTableBuilderMetadata } from '@/app/sql-table-builder/layout';
import { metadata as talksMetadata } from '@/app/talks/layout';
import { metadata as textDiffMetadata } from '@/app/text-diff/layout';
import { getTalks } from '@/services/talks/talks';

const assistItems = [
  mojiCountMetadata,
  japaneseTextFixerMetadata,
  qrGeneratorMetadata,
  baseConverterMetadata,
  contrastCheckerMetadata,
  colorConverterMetadata,
  radiusMakerMetadata,
  sqlTableBuilderMetadata,
  quizzesMetadata,
  textDiffMetadata,
];

type MetadataLike = {
  title?: unknown;
  description?: unknown;
};

function _formatMetadataSection(metadata: MetadataLike): string {
  return `### ${String(metadata.title ?? '')}\n${String(metadata.description ?? '')}`;
}

async function _generateLlmContent() {
  'use cache';

  const [blogs, talks] = await Promise.all([getBlogContents(), getTalks()]);

  const blogContent = blogs
    .map((blog) => {
      if (!blog.description) {
        return `#### ${blog.title}`;
      }
      return `#### ${blog.title}\n${blog.description}`;
    })
    .join('\n\n');

  const talkContent = talks
    .map((talk) => `#### ${talk.title}\n${talk.eventName}（${talk.eventDate}）`)
    .join('\n\n');

  // metadata とサブコンテンツを直接紐付け
  const forgeItems: {
    metadata: MetadataLike;
    subContent?: string;
  }[] = [
    { metadata: blogMetadata, subContent: blogContent },
    { metadata: talksMetadata, subContent: talkContent },
    { metadata: playgroundsMetadata },
  ];

  const forgeContent = forgeItems
    .map(({ metadata, subContent }) => {
      const base = _formatMetadataSection(metadata);
      if (subContent) {
        return `${base}\n\n${subContent}`;
      }
      return base;
    })
    .join('\n\n');

  const assistContent = assistItems
    .map((item) => _formatMetadataSection(item))
    .join('\n\n');

  return `# k8o
WebフロントエンドとTypeScriptが好きで、Baselineを追いながらWeb標準の進化を楽しんでいます。
デザインシステムの構築を通じて、デザインとフロントエンドの交差点を探っています。

## Forge
考えたことや作ったものを形にして公開する場。

${forgeContent}

### ArteOdyssey
k8o.meで利用しているデザインシステムを紹介します。コンポーネントやデザイントークンを確認できます。

## Assist
日々の作業や日常で役立つちょっとしたツール群。

${assistContent}
`;
}

export async function GET() {
  const content = await _generateLlmContent();

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
