import type { Metadata } from 'next';

import { ArtifactsGuide } from './_components/artifacts-guide';

export const metadata: Metadata = {
  title: '作ったもの | k8o AI Studio',
};

export default function Page() {
  return <ArtifactsGuide />;
}
