import { HomeJsonLd } from '@/components/site/json-ld/home-json-ld';
import { PageMeta, SITE_OG_IMAGE } from '@/components/site/page-meta/page-meta';

export default function HomePage() {
  return (
    <>
      <PageMeta canonical image={SITE_OG_IMAGE} path="/" />
      <HomeJsonLd />
      <p>k8o を k8ordo へ移しています。</p>
    </>
  );
}
