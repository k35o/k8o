import type { Metadata } from 'next';
import { Suspense } from 'react';

import { verifySession } from '@/shared/auth/verify-session';

import { StudioSkeleton } from '../_components/studio';
import { SlidesStudio } from './_components/slides-studio';

export const metadata: Metadata = {
  title: 'スライド生成 | k8o AI Studio',
};

// セッション+許可メールを再チェックする認証ゲート（middleware に加えた多層防御）。
// uncached（DB/cookie）かつ useChat の Math.random もあるため Suspense 配下に置く。
const AuthenticatedSlidesStudio = async () => {
  await verifySession();
  return <SlidesStudio />;
};

export default function Page() {
  return (
    <Suspense fallback={<StudioSkeleton />}>
      <AuthenticatedSlidesStudio />
    </Suspense>
  );
}
