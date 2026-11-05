import type { PageProps } from '@k8ordo/framework';
import * as z from 'zod/mini';

import { JsonLd } from '@/components/site/json-ld/json-ld';
import { PageMeta } from '@/components/site/page-meta/page-meta';
import { TagContent } from '@/components/tags/tag-content/tag-content';
import { TagsFrame } from '@/components/tags/tags-frame/tags-frame';
import { tagBreadcrumbJsonLd } from '@/shared/site/json-ld';
import { getTagContent } from '@/shared/site/tag-contents';

export const paramsSchema = z.object({
  id: z.coerce.number().check(z.int(), z.positive()),
});

export default async function TagPage({ params }: PageProps<'/tags/:id'>) {
  const tag = await getTagContent(params.id);

  return (
    <>
      <PageMeta
        description={`「${tag.name}」タグに関連するブログやトークをまとめたページです。`}
        noindex={tag.blogs.length + tag.talks.length === 0}
        path={`/tags/${tag.id.toString()}`}
        title={`タグ: ${tag.name}`}
      />
      <TagsFrame>
        <JsonLd data={tagBreadcrumbJsonLd(tag)} />
        <TagContent
          blogs={tag.blogs}
          key={tag.id}
          name={tag.name}
          talks={tag.talks}
        />
      </TagsFrame>
    </>
  );
}
