import type { MDXContent } from 'mdx/types';
import type { Metadata } from 'next';

import { BlogLayout } from '@/app/blog/_components/blog-layout';
import { blogMdxComponents } from '@/app/blog/_components/blog-mdx-components';
import { buildBlogMetadata } from '@/features/blog/interface/metadata';
import {
  getBlogContent,
  getBlogContents,
} from '@/features/blog/interface/queries';

// 列挙していない slug（下書きと無い記事）は、既定では App Shell を 200 で先に返し、
// notFound() が 404 にならない。描き終えるまで待たせて 404 を返す
export const ensureStatic = 'navigation';

// 記事は params（URL のデータ）で決まり、App Shell に載らない。記事へのナビゲーションは
// 静的な出力が届くまで待たせ、params を Suspense に入れて中身の無い枠を先に出すことはしない
export const instant = false;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const blogs = await getBlogContents();
  return blogs.map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  return buildBlogMetadata(slug);
}

export default async function Page({ params }: PageProps<'/blog/[slug]'>) {
  const { slug } = await params;
  // BlogLayout も読むが、下書きと無い記事は MDX を import する前に 404 にする
  await getBlogContent(slug);
  // 中身の決まらない import() は any になるので、*.mdx の型に揃える
  const { default: Article } = (await import(
    `@/content/blog/${slug}/article.mdx`
  )) as { default: MDXContent };

  return (
    <BlogLayout slug={slug}>
      <Article components={blogMdxComponents} />
    </BlogLayout>
  );
}
