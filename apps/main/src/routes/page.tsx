import { getArtifacts } from '@/components/artifacts/artifacts/artifacts';
import { Home } from '@/components/site/home/home';
import { HomeJsonLd } from '@/components/site/json-ld/home-json-ld';
import { PageMeta } from '@/components/site/page-meta/page-meta';
import { getActivity } from '@/features/activity/interface/queries';
import { getFeatureBlogMap } from '@/features/blog/interface/queries';

export default async function HomePage() {
  const [activity, featureBlogs] = await Promise.all([
    getActivity(getArtifacts()),
    getFeatureBlogMap(),
  ]);

  return (
    <>
      <PageMeta path="/" rssFeedPath="/blog/feed" />
      <HomeJsonLd />
      <Home activity={activity} featureBlogs={featureBlogs} />
    </>
  );
}
