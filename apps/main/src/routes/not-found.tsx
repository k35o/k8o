import { NotFound } from '@/components/site/not-found/not-found';
import { PageMeta, SITE_OG_IMAGE } from '@/components/site/page-meta/page-meta';

export default function NotFoundPage() {
  return (
    <>
      <PageMeta image={SITE_OG_IMAGE} noindex path="/" />
      <NotFound />
    </>
  );
}
