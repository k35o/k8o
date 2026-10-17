import { verifySession } from '@repo/auth-shell/verify-session';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import {
  loadArtifactForRoute,
  versionFromParam,
} from '@/features/artifacts/interface/queries';

import { ArtifactScreen } from '../_components/artifact-screen';
import { ArtifactSkeleton } from '../_components/artifact-skeleton';

export const metadata: Metadata = {
  title: '作ったもの | k8o AI Studio',
};

const Artifact = async ({
  params,
  searchParams,
}: PageProps<'/artifacts/[artifactId]'>) => {
  await verifySession();
  const { artifactId } = await params;
  const version = versionFromParam((await searchParams)['v']);
  if (version === 'invalid') {
    notFound();
  }
  const artifact = await loadArtifactForRoute(artifactId, version);
  if (artifact === null) {
    notFound();
  }
  return <ArtifactScreen artifact={artifact} />;
};

export default function Page(props: PageProps<'/artifacts/[artifactId]'>) {
  return (
    <Suspense fallback={<ArtifactSkeleton />}>
      <Artifact {...props} />
    </Suspense>
  );
}
