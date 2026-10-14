'use client';

import { useChat } from '@ai-sdk/react';
import { APICallError, DefaultChatTransport } from 'ai';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { FC } from 'react';

import { threadTitleFrom } from '@/features/agent/application/agent-message';
import type { AgentUIMessage } from '@/features/agent/application/agent-message';
import {
  createdAtAfterSync,
  deferredStopAfter,
  isStopping,
  serverSyncAfter,
  stopRequestOnPress,
  unsavedUserText,
} from '@/features/agent/application/thread-sync';
import type {
  ServerSync,
  StopRequest,
} from '@/features/agent/application/thread-sync';
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

const requestStop = async (threadId: string): Promise<void> => {
  try {
    await fetch(`/api/chat/${threadId}/stop`, { method: 'POST' });
  } catch (stopError) {
    console.error('停止を要求できませんでした', stopError);
  }
};

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
  const [stopRequest, setStopRequest] = useState<StopRequest | null>(null);

  const titleOf = (
    current: AgentUIMessage[],
    threadCreatedAt: string | null,
  ): string | null => {
    if (thread.title !== null) {
      return thread.title;
    }
    const firstUserMessage = current.find((message) => message.role === 'user');
    return threadCreatedAt === null || firstUserMessage === undefined
      ? null
      : threadTitleFrom(firstUserMessage);
  };
  const touchThread = (title: string | null, running: boolean): void => {
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
        touchThread(titleOf(finish.messages, createdAt), false);
      } else {
        setSync(next);
      }
    },
  });

  useThreadSync({
    threadId: thread.id,
    mode: sync,
    stopSent: stopRequest === 'sent',
    onSettled: (serverMessages) => {
      if (serverMessages !== null) {
        const unsaved = unsavedUserText(messages, serverMessages);
        if (unsaved !== null) {
          setDraft((current) => (current.trim() === '' ? unsaved : current));
        }
        setMessages(serverMessages);
      }
      setSync(null);
      const settledCreatedAt = createdAtAfterSync({
        createdAt,
        firstSentAt,
        saved: serverMessages,
      });
      setCreatedAt(settledCreatedAt);
      touchThread(titleOf(messages, settledCreatedAt), false);
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

  const title = titleOf(messages, createdAt);

  const showCreated = useEffectEvent((createdTitle: string, at: string) => {
    window.history.replaceState(null, '', `/chat/${thread.id}`);
    // 作られた時刻で触るので、そのあと終わったとして触った行（保存が分かって作られたときも）を上書きしない
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
    setStopRequest(null);
    if (created) {
      touchThread(title, true);
    } else {
      setFirstSentAt(new Date().toISOString());
    }
    void sendMessage({ text }, { body: created ? {} : { model } });
  };

  const handleStop = (): void => {
    setStopRequest(stopRequestOnPress(status));
  };
  if (stopRequest === 'deferred') {
    const next = deferredStopAfter(status);
    if (next !== 'deferred') {
      setStopRequest(next);
    }
  }
  const stopping = isStopping({ request: stopRequest, status, sync });
  const sendStop = useEffectEvent(() => {
    void requestStop(thread.id);
    void stop();
  });
  // 押したときと、応答が流れ始めたとき（描画中に 'sent' へ進める）の両方から1回だけ送るため、effect で送る。
  // 止まり終えたあとに Activity で effect が掛け直されても送り直さないよう、停止中のときだけ送る
  useEffect(() => {
    if (stopRequest === 'sent' && stopping) {
      sendStop();
    }
  }, [stopRequest, stopping]);

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
        isStopping={stopping}
        messages={messages}
        model={model}
        onDraftChange={setDraft}
        onSelectModel={setModel}
        onStop={handleStop}
        onSubmit={handleSubmit}
        status={status}
      />
    </>
  );
};
