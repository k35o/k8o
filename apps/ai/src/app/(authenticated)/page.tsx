import { Suspense } from 'react';

import { Studio } from './_components/studio';

// Sandbox プレビューの cold start（起動～配信確保）に数十秒かかることがあるため、
// preview 系 server action がタイムアウトしないよう関数の上限を延ばす。
export const maxDuration = 120;

export default function Page() {
  // useChat（クライアント）が id 生成で Math.random を使うため、Cache Components 下では
  // Suspense 境界で動的サブツリーとして切り出す必要がある。
  return (
    <Suspense fallback={null}>
      <Studio />
    </Suspense>
  );
}
