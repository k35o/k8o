import { NotFound } from '@/components/site/not-found/not-found';
import { PageMeta } from '@/components/site/page-meta/page-meta';

export default function NotFoundPage() {
  return (
    <>
      <PageMeta noindex path="/" />
      <NotFound />
    </>
  );
}
