'use client';

import { useChat } from '@ai-sdk/react';
import { APICallError, DefaultChatTransport } from 'ai';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { FC } from 'react';
import { flushSync } from 'react-dom';

import { threadTitleFrom } from '@/features/agent/application/agent-message';
import type { AgentUIMessage } from '@/features/agent/application/agent-message';
import {
  createdAtAfterSync,
  deferredStopAfter,
  isStopping,
  serverSyncAfter,
  stopRequestAfterFailedSend,
  stopRequestOnPress,
  unsavedUserText,
} from '@/features/agent/application/thread-sync';
import type {
  ServerSync,
  StopRequest,
} from '@/features/agent/application/thread-sync';
import {
  lastCallKeyOf,
  paneVersionsOf,
  shownArtifact,
  uiArtifactsOf,
  uiLiveOf,
} from '@/features/agent/application/ui-artifacts';
import type { PaneSelection } from '@/features/agent/application/ui-artifacts';
import { highlightGenerated } from '@/features/highlight/interface/actions';
import { DEFAULT_GENERATION_MODEL } from '@/shared/claude/models';
import type { GenerationModel } from '@/shared/claude/models';

import { ToolHeader } from '../../../_components/tool-frame';
import { ViewTabs } from '../../../_components/view-tabs';
import { ARTIFACT_VIEW_OPTIONS, ArtifactPane } from '../artifact-pane';
import type { ArtifactView } from '../artifact-pane';
import { ChatPanes, usePaneFocus } from '../chat-panes';
import { ChatHeader, ChatView } from '../chat-view';
import { useOpeningThread } from '../opening-thread';
import { useTouchedThreads } from '../touched-threads';
import { usePanePin } from './use-pane-pin';
import { useThreadSync } from './use-thread-sync';

import styles from './chat-screen.module.css';

// 履歴はサーバーが持っているので、送るのは最後のメッセージだけにする
const transport = new DefaultChatTransport<AgentUIMessage>({
  api: '/api/chat',
  prepareSendMessagesRequest: ({ id, messages, trigger, body }) => ({
    body: { ...body, threadId: id, trigger, message: messages.at(-1) },
  }),
});

const MOBILE_TAB_OPTIONS = [
  { value: 'chat', label: 'チャット' },
  ...ARTIFACT_VIEW_OPTIONS,
] as const;

const requestStop = async (threadId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/chat/${threadId}/stop`, {
      method: 'POST',
    });
    if (!response.ok) {
      console.error('停止を要求できませんでした', response.status);
    }
    return response.ok;
  } catch (stopError) {
    console.error('停止を要求できませんでした', stopError);
    return false;
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
  const { forget: forgetOpening } = useOpeningThread();
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
  const [closed, setClosed] = useState<Extract<
    PaneSelection,
    { type: 'closed' }
  > | null>(null);
  const [view, setView] = useState<ArtifactView>('preview');
  const [expanded, setExpanded] = useState(false);
  const threadPath = `/chat/${thread.id}`;
  const { pinned, pin, unpin } = usePanePin(threadPath);
  const paneFocus = usePaneFocus();

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
        model,
        updatedAt: new Date().toISOString(),
        running,
      });
    }
  };

  const forgetShownOpening = useEffectEvent(forgetOpening);
  useEffect(() => {
    forgetShownOpening();
  }, []);

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
    stopSent: stopRequest === 'released' || stopRequest === 'sent',
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
    // Activity から戻るたびに走り直すので、もう移っていれば、開いたペインの検索パラメータと履歴の印を捨てないよう書き直さない
    if (window.location.pathname !== threadPath) {
      window.history.replaceState(null, '', threadPath);
    }
    // 作られた時刻で触るので、そのあと終わったとして触った行（保存が分かって作られたときも）を上書きしない
    touch({
      id: thread.id,
      title: createdTitle,
      model,
      updatedAt: at,
      running: true,
    });
  });
  useEffect(() => {
    if (createdAt !== null && title !== null) {
      showCreated(title, createdAt);
    }
  }, [createdAt, title]);

  const sendStop = (): void => {
    void requestStop(thread.id).then((delivered) => {
      if (!delivered) {
        setStopRequest(stopRequestAfterFailedSend);
      }
    });
    void stop();
  };
  const handleStop = (): void => {
    const next = stopRequestOnPress(status);
    setStopRequest(next);
    if (next === 'sent') {
      sendStop();
    }
  };
  if (stopRequest === 'deferred') {
    const next = deferredStopAfter(status);
    if (next !== 'deferred') {
      setStopRequest(next);
    }
  }
  const stopping = isStopping({ request: stopRequest, status, sync });
  const sendReleasedStop = useEffectEvent(sendStop);
  // 応答が流れ始めたこと（描画中に 'released' へ進める）を受けて送るので、effect で送る。
  // 止まり終えたあとに Activity で effect が掛け直されても送り直さないよう、停止中のときだけ送る
  useEffect(() => {
    if (stopRequest === 'released' && stopping) {
      sendReleasedStop();
    }
  }, [stopRequest, stopping]);

  const artifacts = uiArtifactsOf(messages, {
    live: uiLiveOf({ status, isServerRunning: sync === 'wait' }),
    isStopping: stopping,
  });
  const shown = shownArtifact(
    artifacts,
    pinned ?? closed ?? { type: 'follow' },
  );
  // ペインは閉じるボタンを通らずにも消える（戻るで閉じた状態が効く、出せる UI の生成が失敗するなど）。
  // 広げた状態を残すと、次に出たペインで押したカードや書いている入力欄ごと会話が隠れるので捨てる
  if (expanded && shown === null) {
    setExpanded(false);
  }
  const pinCall = (toolCallId: string): void => {
    pin({ type: 'pinned', toolCallId, lastCallKey: lastCallKeyOf(artifacts) });
  };
  const versions = paneVersionsOf(artifacts, shown);
  const openArtifact = (toolCallId: string): void => {
    paneFocus.openPane(toolCallId, () => {
      pinCall(toolCallId);
      setView('preview');
    });
  };
  const changeMobileTab = (tab: 'chat' | ArtifactView): void => {
    if (tab === 'chat') {
      unpin();
      return;
    }
    setView(tab);
    if (pinned === null && shown !== null) {
      pinCall(shown.toolCallId);
    }
  };
  const closePane = (toolCallId: string): void => {
    // 広げたままだとカードのボタンが隠れた会話の中にあり、フォーカスを移せないので、先に会話を出して描く
    flushSync(() => {
      setExpanded(false);
    });
    paneFocus.closePane(toolCallId, () => {
      setClosed({ type: 'closed', lastCallKey: lastCallKeyOf(artifacts) });
      unpin();
    });
  };

  const handleSubmit = (text: string): void => {
    clearError();
    setDraft('');
    setStopRequest(null);
    // ペインに出せるものが無いまま固定が残っていると、次の生成で xl 未満の画面がプレビューへ勝手に移るので、外す
    if (pinned !== null && shown === null) {
      unpin();
    }
    if (created) {
      touchThread(title, true);
    } else {
      setFirstSentAt(new Date().toISOString());
    }
    void sendMessage({ text }, { body: created ? {} : { model } });
  };

  return (
    <>
      <ToolHeader>
        <ChatHeader model={model} title={title} />
      </ToolHeader>
      {shown === null ? null : (
        <div className={styles.mobileTabs}>
          <ViewTabs
            onChange={changeMobileTab}
            options={MOBILE_TAB_OPTIONS}
            value={pinned === null ? 'chat' : view}
          />
        </div>
      )}
      <ChatPanes
        chat={
          <ChatView
            artifactButtonRef={paneFocus.artifactButtonRef}
            canSelectModel={!created && messages.length === 0}
            draft={draft}
            errorText={error?.message ?? null}
            inputRef={paneFocus.inputRef}
            isServerRunning={sync === 'wait'}
            isStopping={stopping}
            messages={messages}
            model={model}
            onDraftChange={setDraft}
            onOpenArtifact={openArtifact}
            onSelectModel={setModel}
            onStop={handleStop}
            onSubmit={handleSubmit}
            selectedToolCallId={shown?.toolCallId ?? null}
            status={status}
          />
        }
        expanded={expanded}
        mobilePane={pinned === null ? 'chat' : 'pane'}
        pane={
          shown === null ? null : (
            <ArtifactPane
              artifact={shown}
              expanded={expanded}
              headingRef={paneFocus.headingRef}
              highlight={highlightGenerated}
              onClose={() => {
                closePane(shown.toolCallId);
              }}
              onExpandedChange={setExpanded}
              onSelectVersion={pinCall}
              onViewChange={setView}
              versions={versions}
              view={view}
            />
          )
        }
      />
    </>
  );
};
