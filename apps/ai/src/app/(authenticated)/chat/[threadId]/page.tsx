import { verifySession } from '@repo/auth-shell/verify-session';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { loadThreadForRoute } from '@/features/agent/interface/queries';

import { ChatScreen } from '../_components/chat-screen';
import { ChatSkeleton } from '../_components/chat-skeleton';

export const metadata: Metadata = {
  title: 'チャット | k8o AI Studio',
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
      initialMessages={thread.messages}
      initialRunning={thread.running}
      key={thread.id}
      thread={{ id: thread.id, title: thread.title, model: thread.model }}
    />
  );
};

export default function Page({ params }: PageProps<'/chat/[threadId]'>) {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <ExistingChat params={params} />
    </Suspense>
  );
}
