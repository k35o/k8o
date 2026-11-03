import { AboutIndex } from '@/components/about/about-index/about-index';
import { PageMeta } from '@/components/site/page-meta/page-meta';

export default function AboutPage() {
  return (
    <>
      <PageMeta
        canonical
        description="k8oのプロフィールと、このサイトで公開しているコンテンツの紹介です。"
        path="/about"
        title="About"
      />
      <AboutIndex />
    </>
  );
}
