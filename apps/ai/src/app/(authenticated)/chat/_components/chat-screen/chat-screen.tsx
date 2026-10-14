'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useState } from 'react';
import type { FC } from 'react';

import {
  needsServerSync,
  threadTitleFrom,
} from '@/features/agent/application/agent-message';
import type { AgentUIMessage } from '@/features/agent/application/agent-message';
import type { ThreadListItem } from '@/features/agent/application/threads';
import { DEFAULT_GENERATION_MODEL } from '@/shared/claude/models';
import type { GenerationModel } from '@/shared/claude/models';

import { ChatShell } from '../chat-shell';
import { ChatHeader, ChatView } from '../chat-view';
import { useThreadSync } from './use-thread-sync';

// 履歴はサーバーが持っているので、送るのは最後のメッセージだけにする
const transport = new DefaultChatTransport<AgentUIMessage>({
  api: '/api/chat',
  prepareSendMessagesRequest: ({ id, messages, trigger, body }) => ({
    body: { ...body, threadId: id, trigger, message: messages.at(-1) },
  }),
});

type ChatScreenProps = {
  thread: { id: string; title: string | null; model: GenerationModel | null };
  initialMessages: AgentUIMessage[];
  initialRunning: boolean;
  initialThreads: ThreadListItem[];
};

export const ChatScreen: FC<ChatScreenProps> = ({
  thread,
  initialMessages,
  initialRunning,
  initialThreads,
}) => {
  const [syncing, setSyncing] = useState(initialRunning);
  const [model, setModel] = useState<GenerationModel>(
    thread.model ?? DEFAULT_GENERATION_MODEL,
  );
  const [firstSentAt, setFirstSentAt] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  const {
    messages,
    sendMessage,
    status,
    stop,
    error,
    clearError,
    setMessages,
  } = useChat<AgentUIMessage>({
    id: thread.id,
    messages: initialMessages,
    transport,
    throttle: 50,
    onFinish: (finish) => {
      if (needsServerSync(finish)) {
        setSyncing(true);
      }
    },
  });

  useThreadSync({
    threadId: thread.id,
    enabled: syncing,
    onSettled: (serverMessages) => {
      setMessages(serverMessages);
      setSyncing(false);
    },
  });

  // 断られた（4xx の）スレッドを URL や一覧に出さないよう、応答が流れ始めてから作られたとみなす
  if (createdAt === null && firstSentAt !== null && status === 'streaming') {
    setCreatedAt(firstSentAt);
  }
  const created = thread.model !== null || createdAt !== null;

  useEffect(() => {
    if (createdAt !== null) {
      window.history.replaceState(null, '', `/chat/${thread.id}`);
    }
  }, [createdAt, thread.id]);

  const firstUserMessage = messages.find((message) => message.role === 'user');
  const title =
    thread.title ??
    (createdAt === null || firstUserMessage === undefined
      ? null
      : threadTitleFrom(firstUserMessage));
  const threads =
    createdAt === null || title === null
      ? initialThreads
      : [
          { id: thread.id, title, updatedAt: createdAt, running: false },
          ...initialThreads,
        ];

  const handleSubmit = (text: string): void => {
    clearError();
    if (!created) {
      setFirstSentAt(new Date().toISOString());
    }
    void sendMessage({ text }, { body: created ? {} : { model } });
  };

  const handleStop = async (): Promise<void> => {
    try {
      await fetch(`/api/chat/${thread.id}/stop`, { method: 'POST' });
    } catch (stopError) {
      console.error('停止を要求できませんでした', stopError);
    }
    if (status === 'submitted' || status === 'streaming') {
      await stop();
    }
  };

  return (
    <ChatShell
      currentThreadId={thread.id}
      header={<ChatHeader model={model} title={title} />}
      threads={threads}
    >
      <ChatView
        canSelectModel={!created && messages.length === 0}
        errorText={error?.message ?? null}
        isServerRunning={syncing}
        messages={messages}
        model={model}
        onSelectModel={setModel}
        onStop={() => {
          void handleStop();
        }}
        onSubmit={handleSubmit}
        status={status}
      />
    </ChatShell>
  );
};
