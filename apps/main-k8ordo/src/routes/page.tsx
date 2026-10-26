import { Home } from '@/components/site/home/home';
import { HomeJsonLd } from '@/components/site/json-ld/home-json-ld';
import { PageMeta, SITE_OG_IMAGE } from '@/components/site/page-meta/page-meta';
import { getBlogContents } from '@/features/blog/interface/queries';

export default async function HomePage() {
  const blogs = await getBlogContents();

  return (
    <>
      <PageMeta canonical image={SITE_OG_IMAGE} path="/" />
      <HomeJsonLd />
      <Home blogs={blogs} />
    </>
  );
}
