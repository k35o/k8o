import { cacheLife } from 'next/cache';
import { getBlogMetadata } from '@/services/blogs/blog';
import { getBlogs } from '@/services/blogs/blogs';

type ApiFeature = {
  feature_id: string;
  name: string;
  baseline: {
    status: 'newly' | 'widely';
    low_date: string;
    high_date?: string;
  };
};

type ApiResponse = {
  data: ApiFeature[];
  metadata: {
    total: number;
    next_page_token?: string;
  };
};

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

const fetchPage = async (
  status: 'newly' | 'widely',
  pageToken?: string,
): Promise<ApiResponse> => {
  const params = new URLSearchParams({
    q: `baseline_status:${status}`,
    page_size: '100',
  });
  if (pageToken) {
    params.set('page_token', pageToken);
  }

  const res = await fetch(
    `https://api.webstatus.dev/v1/features?${params.toString()}`,
  );
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json() as Promise<ApiResponse>;
};

const fetchAllFeatures = async (
  status: 'newly' | 'widely',
  pageToken?: string,
  accumulated: ApiFeature[] = [],
): Promise<ApiFeature[]> => {
  const page = await fetchPage(status, pageToken);
  const features = [...accumulated, ...page.data];
  if (page.metadata.next_page_token) {
    return fetchAllFeatures(status, page.metadata.next_page_token, features);
  }
  return features;
};

const toBaselineFeature = (feature: ApiFeature): BaselineFeature => ({
  featureId: feature.feature_id,
  name: feature.name,
  status: feature.baseline.status,
  date:
    feature.baseline.status === 'widely' && feature.baseline.high_date
      ? feature.baseline.high_date
      : feature.baseline.low_date,
});

export async function getBaselineFeatures(): Promise<{
  features: BaselineFeature[];
}> {
  'use cache';
  cacheLife('hours');

  const [newlyFeatures, widelyFeatures] = await Promise.all([
    fetchAllFeatures('newly'),
    fetchAllFeatures('widely'),
  ]);

  const features = [
    ...newlyFeatures.map(toBaselineFeature),
    ...widelyFeatures.map(toBaselineFeature),
  ].toSorted((a, b) => b.date.localeCompare(a.date));

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
