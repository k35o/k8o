import { ArtifactsIndex } from '@/components/artifacts/artifacts-index/artifacts-index';
import { PageMeta } from '@/components/site/page-meta/page-meta';

export default function ArtifactsPage() {
  return (
    <>
      <PageMeta
        description="dotfilesやskills、自作ツールなどの制作物をまとめています。"
        image={{ path: '/artifacts/og.png', alt: 'artifacts' }}
        path="/artifacts"
        title="Artifacts"
      />
      <ArtifactsIndex />
    </>
  );
}
