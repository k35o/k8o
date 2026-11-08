import type { Blog } from './blogs';

export type BlogLink = {
  slug: string;
  title: string;
};

// 同じ featureId を複数の記事が持つときは、一覧の並び（新しい順）で先の記事を使う
export function buildFeatureBlogMap(
  blogs: readonly Blog[],
): Record<string, BlogLink> {
  const map = new Map<string, BlogLink>();
  for (const blog of blogs) {
    for (const featureId of blog.featureIds) {
      const existing = map.get(featureId);
      if (existing) {
        console.warn(
          `featureId "${featureId}" が複数の記事で指定されています: ${existing.slug}, ${blog.slug}（${existing.slug} を使用）`,
        );
        continue;
      }
      map.set(featureId, { slug: blog.slug, title: blog.title });
    }
  }
  return Object.fromEntries(map);
}
