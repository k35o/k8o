import { verifySession } from '@repo/auth-shell/verify-session';
import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ChatScreen } from './_components/chat-screen';
import { NewChatPlaceholder } from './_components/new-chat-placeholder';

export const metadata: Metadata = {
  title: 'チャット | k8o AI Studio',
};

const NewChat = async ({
  searchParams,
}: {
  searchParams: PageProps<'/chat'>['searchParams'];
}) => {
  await verifySession();
  // useChat の id にするので、行より先にここで決める。verifySession が connection() を
  // 呼んだあとなので、要求のたびに新しい値になる
  const threadId = crypto.randomUUID();
  // ?draft= はだれでも作れる URL なので、入力欄に入れるだけで送らない
  const { draft } = await searchParams;
  return (
    <ChatScreen
      initialDraft={typeof draft === 'string' ? draft : ''}
      initialMessages={[]}
      initialRunning={false}
      key={threadId}
      thread={{ id: threadId, title: null, model: null }}
    />
  );
};

export default function Page({ searchParams }: PageProps<'/chat'>) {
  return (
    <Suspense fallback={<NewChatPlaceholder />}>
      <NewChat searchParams={searchParams} />
    </Suspense>
  );
}
