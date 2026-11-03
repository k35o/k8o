import { ContactIndex } from '@/components/contact/contact-index/contact-index';
import { PageMeta } from '@/components/site/page-meta/page-meta';

export default function ContactPage() {
  return (
    <>
      <PageMeta
        canonical
        description="k8oへの連絡手段の一覧です。"
        path="/contact"
        title="Contact"
      />
      <ContactIndex />
    </>
  );
}
