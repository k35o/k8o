'use client';

import { useChat } from '@ai-sdk/react';
import { APICallError, DefaultChatTransport } from 'ai';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { FC } from 'react';

import { threadTitleFrom } from '@/features/agent/application/agent-message';
import type { AgentUIMessage } from '@/features/agent/application/agent-message';
import {
  serverSyncAfter,
  unsavedUserText,
} from '@/features/agent/application/thread-sync';
import type { ServerSync } from '@/features/agent/application/thread-sync';
import { DEFAULT_GENERATION_MODEL } from '@/shared/claude/models';
import type { GenerationModel } from '@/shared/claude/models';

import { ToolHeader } from '../../../_components/tool-frame';
import { ChatHeader, ChatView } from '../chat-view';
import { useTouchedThreads } from '../touched-threads';
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
};

export const ChatScreen: FC<ChatScreenProps> = ({
  thread,
  initialMessages,
  initialRunning,
}) => {
  const { touch } = useTouchedThreads();
  const [sync, setSync] = useState<ServerSync | null>(
    initialRunning ? 'wait' : null,
  );
  const [model, setModel] = useState<GenerationModel>(
    thread.model ?? DEFAULT_GENERATION_MODEL,
  );
  const [firstSentAt, setFirstSentAt] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const titleOf = (current: AgentUIMessage[]): string | null => {
    if (thread.title !== null) {
      return thread.title;
    }
    const firstUserMessage = current.find((message) => message.role === 'user');
    return createdAt === null || firstUserMessage === undefined
      ? null
      : threadTitleFrom(firstUserMessage);
  };
  const touchThread = (current: AgentUIMessage[], running: boolean): void => {
    const title = titleOf(current);
    if (title !== null) {
      touch({
        id: thread.id,
        title,
        updatedAt: new Date().toISOString(),
        running,
      });
    }
  };

  const rejectedRef = useRef(false);
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
    // SDK は onError を onFinish より先に呼ぶ。HTTP の応答で断られたときだけ APICallError になる
    onError: (chatError) => {
      rejectedRef.current = APICallError.isInstance(chatError);
    },
    onFinish: (finish) => {
      const next = serverSyncAfter(finish, rejectedRef.current);
      rejectedRef.current = false;
      if (next === null) {
        touchThread(finish.messages, false);
      } else {
        setSync(next);
      }
    },
  });

  useThreadSync({
    threadId: thread.id,
    mode: sync,
    onSettled: (serverMessages) => {
      if (serverMessages !== null) {
        const unsaved = unsavedUserText(messages, serverMessages);
        if (unsaved !== null) {
          setDraft((current) => (current.trim() === '' ? unsaved : current));
        }
        setMessages(serverMessages);
      }
      setSync(null);
      touchThread(messages, false);
    },
    onRunning: () => {
      setSync('wait');
    },
  });

  // 断られた（4xx の）スレッドを URL や一覧に出さないよう、応答が流れ始めてから作られたとみなす
  if (createdAt === null && firstSentAt !== null && status === 'streaming') {
    setCreatedAt(firstSentAt);
  }
  const created = thread.model !== null || createdAt !== null;

  const title = titleOf(messages);

  const showCreated = useEffectEvent((createdTitle: string, at: string) => {
    window.history.replaceState(null, '', `/chat/${thread.id}`);
    touch({ id: thread.id, title: createdTitle, updatedAt: at, running: true });
  });
  useEffect(() => {
    if (createdAt !== null && title !== null) {
      showCreated(title, createdAt);
    }
  }, [createdAt, title]);

  const handleSubmit = (text: string): void => {
    clearError();
    setDraft('');
    if (created) {
      touchThread(messages, true);
    } else {
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
    <>
      <ToolHeader>
        <ChatHeader model={model} title={title} />
      </ToolHeader>
      <ChatView
        canSelectModel={!created && messages.length === 0}
        draft={draft}
        errorText={error?.message ?? null}
        isServerRunning={sync === 'wait'}
        messages={messages}
        model={model}
        onDraftChange={setDraft}
        onSelectModel={setModel}
        onStop={() => {
          void handleStop();
        }}
        onSubmit={handleSubmit}
        status={status}
      />
    </>
  );
};
