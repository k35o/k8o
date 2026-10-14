import { verifySession } from '@repo/auth-shell/verify-session';
import type { Metadata } from 'next';
import { Suspense } from 'react';

import { listThreadsForRoute } from '@/features/agent/interface/queries';

import { ChatScreen } from './_components/chat-screen';
import { ChatSkeleton } from './_components/chat-skeleton';

export const metadata: Metadata = {
  title: 'チャット | k8o AI Studio',
};

const NewChat = async () => {
  await verifySession();
  const threads = await listThreadsForRoute();
  // useChat の id にするので、行より先にここで決める。verifySession が connection() を
  // 呼んだあとなので、要求のたびに新しい値になる
  const threadId = crypto.randomUUID();
  return (
    <ChatScreen
      initialMessages={[]}
      initialRunning={false}
      initialThreads={threads}
      key={threadId}
      thread={{ id: threadId, title: null, model: null }}
    />
  );
};

export default function Page() {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <NewChat />
    </Suspense>
  );
}
