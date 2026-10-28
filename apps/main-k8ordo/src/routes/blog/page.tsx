import { BlogIndex } from '@/components/blog/blog-index/blog-index';
import { PageMeta } from '@/components/site/page-meta/page-meta';
import { getBlogContents } from '@/features/blog/interface/queries';

export default async function BlogIndexPage() {
  const blogs = await getBlogContents();

  return (
    <>
      <PageMeta
        description="Webフロントエンドを中心に、日々のことも書いています。"
        image={{ path: '/blog/og.png', alt: 'blog' }}
        path="/blog"
        rssFeedPath="/blog/feed"
        title="Blog"
      />
      <BlogIndex blogs={blogs} />
    </>
  );
}
