import { verifySession } from '@repo/auth-shell/verify-session';
import { Suspense } from 'react';

import { listProjectsForRoute } from '@/features/projects/interface/queries';

import { Studio, StudioSkeleton } from './_components/studio';

// セッション+許可メールを再チェックする認証ゲート（middleware に加えた多層防御）。
// uncached（DB/cookie）かつ useChat の Math.random もあるため Suspense 配下に置く。
const AuthenticatedStudio = async () => {
  await verifySession();
  const projects = await listProjectsForRoute();
  return <Studio initialProjects={projects} />;
};

export default function Page() {
  return (
    <Suspense fallback={<StudioSkeleton />}>
      <AuthenticatedStudio />
    </Suspense>
  );
}
