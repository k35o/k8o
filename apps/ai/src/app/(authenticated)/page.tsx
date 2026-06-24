import { Suspense } from 'react';

import { Studio } from './_components/studio';

export default function Page() {
  // useChat（クライアント）が id 生成で Math.random を使うため、Cache Components 下では
  // Suspense 境界で動的サブツリーとして切り出す必要がある。
  return (
    <Suspense fallback={null}>
      <Studio />
    </Suspense>
  );
}
