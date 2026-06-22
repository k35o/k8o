'use client';

/* oxlint-disable import/max-dependencies -- Studio はチャット/生成/プレビュー/履歴を束ねる統合点。
   プレビュー列(PreviewPane)やフックへの更なる分解は別タスクの余地として許容する。 */

import { useChat } from '@ai-sdk/react';
import { Button, FormControl, Heading, Textarea } from '@k8o/arte-odyssey';
import { DefaultChatTransport } from 'ai';
import { useTheme } from 'next-themes';
import {
  type KeyboardEvent,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';

import {
  generationReducer,
  initialGenerationState,
} from '@/features/generation/application/generation-store';
import {
  messageText,
  parseGeneration,
} from '@/features/generation/application/parse-generation';
import {
  applyPreviewCode,
  startPreviewSession,
} from '@/features/preview/interface/actions';

import { CodePanel, CopyCodeButton } from './code-panel';
import { PreviewFrame } from './preview-frame';
import { ProjectHistory } from './project-history';
import { useStudioPersistence } from './use-studio-persistence';

type PanelView = 'preview' | 'code';

export const Studio = () => {
  const [input, setInput] = useState('');
  const [state, dispatch] = useReducer(
    generationReducer,
    initialGenerationState,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewNonce, setPreviewNonce] = useState(0);
  const [view, setView] = useState<PanelView>('preview');
  const [applyError, setApplyError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const persistence = useStudioPersistence();

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/generate' }),
    onFinish: ({ message }) => {
      const parsed = parseGeneration(messageText(message));
      if (parsed.code !== null && parsed.meta !== null) {
        dispatch({
          type: 'generation-finished',
          id: message.id,
          code: parsed.code,
          meta: parsed.meta,
          createdAt: Date.now(),
        });
        // 履歴に永続化（projectId が無ければ新規プロジェクト＋初版を作る）。
        void persistence.save({ code: parsed.code, meta: parsed.meta });
        // プレビューに反映（テンプレへ書き込み→iframe を貼り直して最新を表示）。
        void (async () => {
          if (parsed.code === null) {
            return;
          }
          const res = await applyPreviewCode(parsed.code);
          if (res.ok) {
            setApplyError(null);
            setPreviewNonce((nonce) => nonce + 1);
            setView('preview');
            return;
          }
          // 不正 import 等で反映できなかった。エラーを次ターンの system に流して自動修復を促し、
          // ユーザーにも提示する（プレビューは前回の正常版のまま＝白画面にしない）。
          if (res.error !== undefined) {
            setApplyError(res.error);
            dispatch({ type: 'build-failed', errors: res.error });
            setView('code');
          }
        })();
      }
    },
  });

  const isBusy = status === 'submitted' || status === 'streaming';

  // 起動時にプレビューセッション（ローカルVite）を用意する。
  useEffect(() => {
    void (async () => {
      const res = await startPreviewSession();
      if (res !== null) {
        setPreviewUrl(res.url);
      }
    })();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const lastAssistant = messages.findLast(
    (message) => message.role === 'assistant',
  );
  const streamingCode =
    lastAssistant === undefined
      ? null
      : parseGeneration(messageText(lastAssistant)).code;
  const displayedCode = isBusy
    ? (streamingCode ?? state.currentFile)
    : state.currentFile;
  const codeTitle = state.versions.at(-1)?.meta.title;
  const hasResult = state.currentFile !== null;

  const handleGenerate = async (): Promise<void> => {
    const text = input.trim();
    if (text === '' || isBusy) {
      return;
    }
    setInput('');
    setApplyError(null);
    await sendMessage(
      { text },
      {
        body: {
          currentFile: state.currentFile,
          buildErrors: state.buildErrors,
          model: state.selectedModel,
        },
      },
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void handleGenerate();
    }
  };

  const handleFullscreen = (): void => {
    const el = frameRef.current;
    if (el !== null) {
      void el.requestFullscreen().catch(() => undefined);
    }
  };

  const handleNewProject = (): void => {
    persistence.reset();
    dispatch({ type: 'reset' });
    setMessages([]);
    setApplyError(null);
    setHistoryOpen(false);
    setView('preview');
  };

  const handleSelectProject = async (id: number): Promise<void> => {
    setHistoryOpen(false);
    const project = await persistence.load(id);
    if (project === null) {
      return;
    }
    dispatch({
      type: 'load-project',
      id: `db-${project.versionId.toString()}`,
      code: project.code,
      meta: project.meta,
      createdAt: Date.now(),
    });
    setMessages([]);
    setApplyError(null);
    const res = await applyPreviewCode(project.code);
    if (res.ok) {
      setPreviewNonce((nonce) => nonce + 1);
      setView('preview');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Heading type="h1">k8o AI Studio</Heading>
          <p className="text-fg-mute text-sm leading-relaxed">
            作りたい画面を伝えると、arte-odyssey で UI を生成します。
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {persistence.projectTitle === null ? null : (
            <span className="text-fg-mute hidden max-w-40 truncate text-sm md:inline">
              {persistence.projectTitle}
            </span>
          )}
          <Button
            color="gray"
            onClick={() => {
              setHistoryOpen(true);
            }}
            size="sm"
            variant="skeleton"
          >
            履歴
          </Button>
          <Button
            color="primary"
            onClick={handleNewProject}
            size="sm"
            variant="skeleton"
          >
            新規
          </Button>
        </div>
      </div>

      <ProjectHistory
        currentProjectId={persistence.projectId}
        isOpen={historyOpen}
        onClose={() => {
          setHistoryOpen(false);
        }}
        onSelect={(id) => {
          void handleSelectProject(id);
        }}
        projects={persistence.projects}
      />

      <div className="grid gap-6 lg:h-[calc(100svh-14rem)] lg:grid-cols-[360px_1fr] lg:grid-rows-1">
        {/* チャット */}
        <div className="bg-bg-base border-border-mute flex h-136 flex-col rounded-2xl border shadow-sm lg:h-full">
          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
                <p className="text-fg-base text-sm font-bold">
                  UI を生成しましょう
                </p>
                <p className="text-fg-mute text-sm leading-relaxed">
                  例: 「お問い合わせフォームのカード」「料金プランの3カラム」
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {messages.map((message) => {
                  const text = messageText(message);
                  if (message.role === 'user') {
                    return (
                      <div className="flex justify-end" key={message.id}>
                        <p className="bg-primary-bg-subtle text-fg-base max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed">
                          {text}
                        </p>
                      </div>
                    );
                  }
                  const description = parseGeneration(text).meta?.description;
                  return (
                    <div className="flex flex-col gap-1.5" key={message.id}>
                      <span className="text-fg-mute text-xs font-bold">AI</span>
                      <p className="text-fg-base text-sm leading-relaxed">
                        {description ??
                          (isBusy ? '生成中…' : 'コードを更新しました')}
                      </p>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-border-mute flex flex-col gap-3 border-t p-4">
            <FormControl
              disabled={isBusy}
              label="作りたいもの"
              renderInput={(props) => (
                <Textarea
                  {...props}
                  onChange={(event) => {
                    setInput(event.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="お問い合わせフォームのカードを作って"
                  rows={3}
                  value={input}
                />
              )}
            />
            <div className="flex items-center justify-between gap-3">
              {applyError === null ? (
                error === undefined ? (
                  <span className="text-fg-mute text-xs">
                    ⌘/Ctrl + Enter で送信
                  </span>
                ) : (
                  <span className="text-fg-error text-xs">
                    エラーが発生しました。再試行してください。
                  </span>
                )
              ) : (
                <span className="text-fg-error text-xs leading-relaxed">
                  {applyError} 「直して」と送ると修正します。
                </span>
              )}
              <Button
                color="primary"
                disabled={isBusy || input.trim() === ''}
                onAction={handleGenerate}
                variant="solid"
              >
                生成する
              </Button>
            </div>
          </div>
        </div>

        {/* プレビュー / コード */}
        <div className="flex h-136 flex-col gap-3 lg:h-full">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                color="primary"
                onClick={() => {
                  setView('preview');
                }}
                size="sm"
                variant={view === 'preview' ? 'solid' : 'skeleton'}
              >
                プレビュー
              </Button>
              <Button
                color="primary"
                onClick={() => {
                  setView('code');
                }}
                size="sm"
                variant={view === 'code' ? 'solid' : 'skeleton'}
              >
                コード
              </Button>
            </div>
            <div className="flex items-center gap-3">
              {codeTitle === undefined ? null : (
                <span className="text-fg-mute hidden text-sm sm:inline">
                  {codeTitle}
                </span>
              )}
              <CopyCodeButton code={hasResult ? displayedCode : null} />
              <Button
                color="gray"
                disabled={!hasResult}
                onClick={handleFullscreen}
                size="sm"
                variant="skeleton"
              >
                全画面
              </Button>
            </div>
          </div>

          <div
            className="bg-bg-base border-border-mute min-h-0 flex-1 overflow-hidden rounded-2xl border shadow-sm"
            ref={frameRef}
          >
            <div className={view === 'preview' ? 'h-full' : 'hidden'}>
              {previewUrl !== null && hasResult ? (
                <PreviewFrame
                  key={previewNonce}
                  theme={resolvedTheme}
                  url={previewUrl}
                />
              ) : (
                <div className="text-fg-mute flex h-full items-center justify-center p-6 text-center text-sm leading-relaxed">
                  生成すると、ここにライブプレビューが表示されます
                </div>
              )}
            </div>
            <div className={view === 'code' ? 'h-full' : 'hidden'}>
              <CodePanel code={displayedCode} isStreaming={isBusy} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
