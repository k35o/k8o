import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { loadThreadForRoute } from '@/features/agent/interface/queries';
import { verifySession } from '@/shared/auth/verify-session';

import { ChatScreen } from '../_components/chat-screen';
import { ChatLoading } from '../_components/chat-skeleton';

export const metadata: Metadata = {
  title: 'チャット',
};

const ExistingChat = async ({
  params,
}: {
  params: PageProps<'/chat/[threadId]'>['params'];
}) => {
  await verifySession();
  const { threadId } = await params;
  const thread = await loadThreadForRoute(threadId);
  if (thread === null) {
    notFound();
  }
  return (
    <ChatScreen
      initialDraft=""
      initialMessages={thread.messages}
      initialRunning={thread.running}
      key={thread.id}
      thread={{ id: thread.id, title: thread.title, model: thread.model }}
    />
  );
};

export default function Page({ params }: PageProps<'/chat/[threadId]'>) {
  return (
    <Suspense fallback={<ChatLoading />}>
      <ExistingChat params={params} />
    </Suspense>
  );
}
