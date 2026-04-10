import { db } from '@repo/database';
import { cacheLife } from 'next/cache';
import { getBlogMetadata } from '@/services/blogs/blog';
import { getBlogs } from '@/services/blogs/blogs';

export type BaselineFeature = {
  featureId: string;
  name: string;
  status: 'newly' | 'widely';
  date: string;
};

export type BlogLink = {
  slug: string;
  title: string;
};

export async function getBaselineFeatures(): Promise<{
  features: BaselineFeature[];
}> {
  'use cache';
  cacheLife('minutes');

  const snapshots = await db.query.baselineSnapshots.findMany();

  const features = snapshots
    .map((s) => ({
      featureId: s.featureId,
      name: s.name,
      status: s.status as 'newly' | 'widely',
      date: s.date,
    }))
    .toSorted((a, b) => b.date.localeCompare(a.date));

  return { features };
}

export async function getFeatureBlogMap(): Promise<Record<string, BlogLink>> {
  'use cache';
  cacheLife('max');

  const blogs = await getBlogs();
  const map: Record<string, BlogLink> = {};

  await Promise.all(
    blogs.map(async (blog) => {
      const metadata = await getBlogMetadata(blog.slug);
      if (!metadata.featureIds) return;
      for (const featureId of metadata.featureIds) {
        map[featureId] = { slug: blog.slug, title: metadata.title };
      }
    }),
  );

  return map;
}
