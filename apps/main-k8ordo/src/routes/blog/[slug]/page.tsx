import type { PageProps } from '@k8ordo/framework';

import { BlogArticle } from '@/components/blog/blog-article/blog-article';
import { BlogLayout } from '@/components/blog/blog-layout/blog-layout';
import { PageMeta } from '@/components/site/page-meta/page-meta';
import { getBlogContent } from '@/features/blog/interface/queries';

export default async function BlogPage({ params }: PageProps<'/blog/:slug'>) {
  const { slug } = params;
  const blog = await getBlogContent(slug);

  return (
    <>
      <PageMeta
        article={{
          publishedTime: blog.createdAt,
          modifiedTime: blog.updatedAt,
        }}
        canonical
        category={blog.tags.map((tag) => tag.name).join(', ')}
        description={blog.description}
        image={{ path: `/blog/${slug}/og.png`, alt: blog.title }}
        path={`/blog/${slug}`}
        rssFeedPath="/blog/feed"
        title={blog.title}
        titleTemplate={false}
        twitterCard="summary_large_image"
      />
      <BlogLayout slug={slug}>
        <BlogArticle slug={slug} />
      </BlogLayout>
    </>
  );
}
