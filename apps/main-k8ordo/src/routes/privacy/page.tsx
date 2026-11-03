import { PrivacyIndex } from '@/components/privacy/privacy-index/privacy-index';
import { PageMeta } from '@/components/site/page-meta/page-meta';

export default function PrivacyPage() {
  return (
    <>
      <PageMeta
        canonical
        description="k8o.meにおけるアクセス解析やお問い合わせ情報の取り扱いについて説明します。"
        path="/privacy"
        title="Privacy"
      />
      <PrivacyIndex />
    </>
  );
}
