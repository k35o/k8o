import type { PageProps } from '@k8ordo/framework';
import * as z from 'zod/mini';

import { JsonLd } from '@/components/site/json-ld/json-ld';
import { PageMeta } from '@/components/site/page-meta/page-meta';
import { TagContent } from '@/components/tags/tag-content/tag-content';
import { TagsFrame } from '@/components/tags/tags-frame/tags-frame';
import { getBlogContents } from '@/features/blog/interface/queries';
import { getTag } from '@/features/tags/interface/queries';
import { tagBreadcrumbJsonLd } from '@/shared/site/json-ld';

export const paramsSchema = z.object({
  id: z.coerce.number().check(z.int(), z.positive()),
});

export default async function TagPage({ params }: PageProps<'/tags/:id'>) {
  const [tag, blogContents] = await Promise.all([
    getTag(params.id),
    getBlogContents(),
  ]);

  // 記事の題は MDX にあるので、MDX のある公開済みの記事の一覧から引く。MDX の無い記事はここで落ちる
  const blogTitles = new Map(blogContents.map((blog) => [blog.id, blog.title]));
  const blogs = tag.blogs.flatMap((blog) => {
    const title = blogTitles.get(blog.id);
    return title === undefined ? [] : [{ ...blog, title }];
  });

  return (
    <>
      <PageMeta
        description={`「${tag.name}」タグに関連するブログやトークをまとめたページです。`}
        path={`/tags/${tag.id.toString()}`}
        title={tag.name}
        titleTemplate={false}
      />
      <TagsFrame>
        <JsonLd data={tagBreadcrumbJsonLd(tag)} />
        <TagContent
          blogs={blogs}
          key={tag.id}
          name={tag.name}
          talks={tag.talks}
        />
      </TagsFrame>
    </>
  );
}
