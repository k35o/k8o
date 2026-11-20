import { ArtifactsIndex } from '@/components/artifacts/artifacts-index/artifacts-index';
import { getArtifacts } from '@/components/artifacts/artifacts/artifacts';
import { PageMeta } from '@/components/site/page-meta/page-meta';
import { getLatestReleases } from '@/features/activity/interface/queries';

export default async function ArtifactsPage() {
  const releases = await getLatestReleases(
    getArtifacts().flatMap(({ npmPackageName }) =>
      npmPackageName === null ? [] : [npmPackageName],
    ),
  );

  return (
    <>
      <PageMeta
        description="自作のライブラリやツール、設定をまとめています。"
        image={{ path: '/artifacts/og.png', alt: 'artifacts' }}
        path="/artifacts"
        title="Artifacts"
      />
      <ArtifactsIndex releases={releases} />
    </>
  );
}
