import { getBlogMetadata } from './blog';
import { getBlogs } from './blogs';

export type BlogLink = {
  slug: string;
  title: string;
};

export async function getFeatureBlogMap(): Promise<Record<string, BlogLink>> {
  const blogs = await getBlogs();
  const metadataList = await Promise.all(
    blogs.map(async (blog) => ({
      slug: blog.slug,
      metadata: await getBlogMetadata(blog.slug),
    })),
  );

  // 並列処理中にmapへ直接書き込むと、featureId重複時の勝者が
  // ファイル読み込みの完了順で非決定に決まってしまう。
  // getBlogsの並び（createdAt降順）で逐次確定し、最新記事を勝者にする。
  const map = new Map<string, BlogLink>();
  for (const { slug, metadata } of metadataList) {
    for (const featureId of metadata.featureIds ?? []) {
      const existing = map.get(featureId);
      if (existing) {
        console.warn(
          `featureId "${featureId}" が複数の記事で指定されています: ${existing.slug}, ${slug}（${existing.slug} を使用）`,
        );
        continue;
      }
      map.set(featureId, { slug, title: metadata.title });
    }
  }

  return Object.fromEntries(map);
}
