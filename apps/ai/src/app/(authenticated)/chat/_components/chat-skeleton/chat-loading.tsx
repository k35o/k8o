'use client';

import type { FC } from 'react';

import { useOpeningThread } from '../opening-thread';
import { ChatSkeleton } from './chat-skeleton';

// /chat/[threadId] のプリレンダーでは ID が決まらず、URL を読むと止まるので、一覧で選んだ会話から出す
export const ChatLoading: FC = () => {
  const { thread } = useOpeningThread();
  return <ChatSkeleton thread={thread} />;
};
