import { Suspense } from 'react';

import { verifySession } from '@/shared/auth/verify-session';

import { Studio, StudioSkeleton } from './_components/studio';

// Sandbox プレビューの cold start（起動～配信確保）に数十秒かかることがあるため、
// preview 系 server action がタイムアウトしないよう関数の上限を延ばす。
export const maxDuration = 120;

// セッション+許可メールを再チェックする認証ゲート（middleware に加えた多層防御）。
// uncached（DB/cookie）かつ useChat の Math.random もあるため Suspense 配下に置く。
const AuthenticatedStudio = async () => {
  await verifySession();
  return <Studio />;
};

export default function Page() {
  return (
    <Suspense fallback={<StudioSkeleton />}>
      <AuthenticatedStudio />
    </Suspense>
  );
}
