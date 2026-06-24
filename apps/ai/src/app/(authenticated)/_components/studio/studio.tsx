'use client';

/* oxlint-disable import/max-dependencies -- Studio はチャット/生成/プレビュー/履歴を束ねる統合点。
   プレビュー列(PreviewPane)やフックへの更なる分解は別タスクの余地として許容する。 */

import { useChat } from '@ai-sdk/react';
import {
  Button,
  ForkIcon,
  FullscreenIcon,
  IconButton,
  Textarea,
} from '@k8o/arte-odyssey';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { useTheme } from 'next-themes';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  type KeyboardEvent,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';

import { ToggleTheme } from '@/app/_components/toggle-theme';
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
import { ShareControl } from './share-control';
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
  // 小画面では2ペインを並べられないので、タブで1つずつ表示する。
  const [mobileTab, setMobileTab] = useState<'chat' | 'preview' | 'code'>(
    'chat',
  );
  const [applyError, setApplyError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  // 直近の指示。onFinish（一度きりのクロージャ）から版に保存して会話復元に使う。
  const lastPromptRef = useRef('');
  const { resolvedTheme } = useTheme();
  const persistence = useStudioPersistence();
  const router = useRouter();
  const searchParams = useSearchParams();
  // URL の ?project=<id> を初回レンダーで一度だけ拾い、リロード/ブックマークから復元する。
  const bootProjectIdRef = useRef<number | null | undefined>(undefined);
  if (bootProjectIdRef.current === undefined) {
    const raw = searchParams.get('project');
    const id = raw === null ? Number.NaN : Number(raw);
    bootProjectIdRef.current = Number.isInteger(id) && id > 0 ? id : null;
  }

  const { messages, sendMessage, status, error, setMessages, stop } = useChat({
    transport: new DefaultChatTransport({ api: '/api/generate' }),
    onFinish: ({ message, isAbort }) => {
      // 生成中に別プロジェクトへ切り替えた等で中断された場合は、切替先へ結果を
      // 適用/保存しないよう即座に抜ける（生成中表示の漏れや誤保存を防ぐ）。
      if (isAbort) {
        return;
      }
      const parsed = parseGeneration(messageText(message));
      if (parsed.code !== null && parsed.meta !== null) {
        dispatch({
          type: 'generation-finished',
          id: message.id,
          code: parsed.code,
          meta: parsed.meta,
          createdAt: Date.now(),
        });
        // prompt も版に残し、履歴から読み込んだときに会話を復元できるようにする。
        void persistence.save({
          code: parsed.code,
          meta: parsed.meta,
          prompt: lastPromptRef.current,
        });
        void (async () => {
          if (parsed.code === null) {
            return;
          }
          const res = await applyPreviewCode(parsed.code);
          if (res.ok) {
            setApplyError(null);
            setPreviewNonce((nonce) => nonce + 1);
            setView('preview');
            setMobileTab('preview');
            return;
          }
          // エラーを次ターンの system に流して自動修復を促す（プレビューは前回の正常版のまま＝白画面にしない）。
          if (res.error !== undefined) {
            setApplyError(res.error);
            dispatch({ type: 'build-failed', errors: res.error });
            setView('code');
            setMobileTab('code');
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
  const streamingLines =
    streamingCode === null ? 0 : streamingCode.split('\n').length;
  const lineSuffix =
    streamingLines > 0 ? `（${streamingLines.toString()} 行）` : '';
  const generatingStatus =
    status === 'submitted'
      ? '考えています…'
      : `UI を生成しています…${lineSuffix}`;
  const displayedCode = isBusy
    ? (streamingCode ?? state.currentFile)
    : state.currentFile;
  const hasResult = state.currentFile !== null;
  // 履歴から読み込んだ直後はチャットが空になるため、空状態でも「何を編集中か」を示す。
  const emptyStateTitle = hasResult
    ? `「${state.versions.at(-1)?.meta.title ?? 'プロジェクト'}」を編集中`
    : 'UI を生成しましょう';
  const emptyStateHint = hasResult
    ? '続けて指示すると、このUIを更新します。例:「色を温かいトーンに」「余白を広げて」'
    : '例: 「お問い合わせフォームのカード」「料金プランの3カラム」';
  const currentProject =
    persistence.projects.find(
      (project) => project.id === persistence.projectId,
    ) ?? null;

  const handleGenerate = async (): Promise<void> => {
    const text = input.trim();
    if (text === '' || isBusy) {
      return;
    }
    setInput('');
    setApplyError(null);
    lastPromptRef.current = text;
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
    // 生成中なら中断してから切り替える（生成中表示が新プロジェクトに残るのを防ぐ）。
    void stop();
    persistence.reset();
    dispatch({ type: 'reset' });
    setMessages([]);
    setApplyError(null);
    setHistoryOpen(false);
    setView('preview');
    setMobileTab('chat');
    router.replace('/');
  };

  const handleSelectProject = async (id: number): Promise<void> => {
    // 生成中なら中断してから切り替える（生成中表示が切替先に漏れるのを防ぐ）。
    void stop();
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
    // 履歴を切り替えてもトークが消えないよう会話を復元する。各版を [user(指示) → assistant(meta JSON)] に展開し、
    // assistant は json フェンスにすることで既存の描画ロジック（parseGeneration の description 抽出）で説明文が出る。
    const restored: UIMessage[] = project.conversation.flatMap(
      (turn, index): UIMessage[] => {
        const turnMessages: UIMessage[] = [];
        if (turn.prompt !== null && turn.prompt !== '') {
          turnMessages.push({
            id: `h-u-${index.toString()}`,
            role: 'user',
            parts: [{ type: 'text', text: turn.prompt }],
          });
        }
        turnMessages.push({
          id: `h-a-${index.toString()}`,
          role: 'assistant',
          parts: [
            {
              type: 'text',
              text: `\`\`\`json\n${JSON.stringify(turn.meta)}\n\`\`\``,
            },
          ],
        });
        return turnMessages;
      },
    );
    setMessages(restored);
    setApplyError(null);
    const res = await applyPreviewCode(project.code);
    if (res.ok) {
      setPreviewNonce((nonce) => nonce + 1);
      setView('preview');
      setMobileTab('preview');
    }
  };

  const handleFork = async (): Promise<void> => {
    if (persistence.projectId === null) {
      return;
    }
    const newId = await persistence.fork(persistence.projectId);
    if (newId !== null) {
      await handleSelectProject(newId);
    }
  };

  // 初回マウント時、URL に ?project=<id> があればそのプロジェクトを復元する。
  // 初回レンダーの loader を ref に固定し依存を安定させ、Strict Mode の二重実行でも
  // bootedRef で1回だけロードする。
  const bootLoadRef = useRef(handleSelectProject);
  const bootedRef = useRef(false);
  useEffect(() => {
    if (bootedRef.current) {
      return;
    }
    bootedRef.current = true;
    const bootId = bootProjectIdRef.current;
    if (bootId !== null && bootId !== undefined) {
      void bootLoadRef.current(bootId);
    }
  }, []);

  // 選択中プロジェクトを URL(?project=<id>) に反映する。projectId が null のとき
  // （初期 / boot 中 / 新規）は書き換えない。boot の ?project を握り潰さず、実行回数ではなく
  // 値で判定するため Strict Mode の二重実行でも安全。新規化での「/」戻しは handleNewProject で行う。
  useEffect(() => {
    if (persistence.projectId === null) {
      return;
    }
    router.replace(`/?project=${persistence.projectId.toString()}`);
  }, [persistence.projectId, router]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
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

      <div className="border-border-mute flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-2">
        <div className="flex min-w-0 basis-full items-center gap-2 lg:w-110 lg:shrink-0 lg:grow-0 lg:basis-auto">
          <span className="text-fg-base shrink-0 text-sm font-bold">
            k8o AI Studio
          </span>
          <span className="text-fg-mute shrink-0 text-sm">/</span>
          {persistence.projectId === null ? (
            <span className="text-fg-mute truncate text-sm">
              新しいプロジェクト
            </span>
          ) : (
            <span className="text-fg-base truncate text-sm font-medium">
              {persistence.projectTitle ?? '無題'}
            </span>
          )}
        </div>
        <div className="hidden gap-2 lg:flex">
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
        <div className="flex shrink-0 items-center gap-2 lg:ml-auto">
          {persistence.projectId === null ? null : (
            <>
              <ShareControl
                hasDraft={
                  currentProject?.visibility === 'public' &&
                  currentProject.publishedVersionId !== null &&
                  persistence.currentVersionId !== null &&
                  currentProject.publishedVersionId !==
                    persistence.currentVersionId
                }
                isPublic={currentProject?.visibility === 'public'}
                onChanged={() => {
                  void persistence.refresh();
                }}
                projectId={persistence.projectId}
                slug={currentProject?.slug ?? null}
              />
              <IconButton
                color="base"
                label="フォーク"
                onAction={handleFork}
                size="sm"
              >
                <ForkIcon size="sm" />
              </IconButton>
            </>
          )}
          <div className="hidden items-center gap-3 lg:flex">
            <CopyCodeButton code={hasResult ? displayedCode : null} />
            <IconButton
              color="base"
              disabled={!hasResult}
              label="全画面"
              onClick={handleFullscreen}
              size="sm"
            >
              <FullscreenIcon size="sm" />
            </IconButton>
          </div>
          <div className="border-border-mute mx-1 hidden h-5 border-l lg:block" />
          <Button
            color="gray"
            onClick={() => {
              setHistoryOpen(true);
            }}
            size="sm"
            variant="outline"
          >
            履歴
          </Button>
          <Button
            color="primary"
            onClick={handleNewProject}
            size="sm"
            variant="outline"
          >
            新規
          </Button>
          <ToggleTheme />
        </div>
      </div>

      <div className="flex gap-2 px-4 py-2 lg:hidden">
        <Button
          color="primary"
          onClick={() => {
            setMobileTab('chat');
          }}
          size="sm"
          variant={mobileTab === 'chat' ? 'solid' : 'skeleton'}
        >
          チャット
        </Button>
        <Button
          color="primary"
          onClick={() => {
            setMobileTab('preview');
            setView('preview');
          }}
          size="sm"
          variant={mobileTab === 'preview' ? 'solid' : 'skeleton'}
        >
          プレビュー
        </Button>
        <Button
          color="primary"
          onClick={() => {
            setMobileTab('code');
            setView('code');
          }}
          size="sm"
          variant={mobileTab === 'code' ? 'solid' : 'skeleton'}
        >
          コード
        </Button>
      </div>

      {/* grid-rows-1 で単一ペインも本体高さを満たす（小画面でメッセージがスクロールするように）。 */}
      <div className="grid min-h-0 flex-1 grid-rows-1 lg:grid-cols-[440px_minmax(0,1fr)]">
        <div
          className={`border-border-mute min-h-0 min-w-0 flex-col lg:flex lg:border-r ${
            mobileTab === 'chat' ? 'flex' : 'hidden'
          }`}
        >
          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
                <p className="text-fg-base text-sm font-bold">
                  {emptyStateTitle}
                </p>
                <p className="text-fg-mute text-sm leading-relaxed">
                  {emptyStateHint}
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
                  const working = isBusy && message.id === lastAssistant?.id;
                  return (
                    <div className="flex flex-col gap-1.5" key={message.id}>
                      <span className="text-fg-mute text-xs font-bold">AI</span>
                      {working ? (
                        <p className="text-fg-mute text-sm leading-relaxed motion-safe:animate-pulse">
                          {generatingStatus}
                        </p>
                      ) : (
                        <p className="text-fg-base text-sm leading-relaxed">
                          {description ?? 'コードを更新しました'}
                        </p>
                      )}
                    </div>
                  );
                })}
                {status === 'submitted' ? (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-fg-mute text-xs font-bold">AI</span>
                    <p className="text-fg-mute text-sm leading-relaxed motion-safe:animate-pulse">
                      {generatingStatus}
                    </p>
                  </div>
                ) : null}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-border-mute flex flex-col gap-2 border-t p-4">
            <Textarea
              aria-label="作りたいもの"
              disabled={isBusy}
              onChange={(event) => {
                setInput(event.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder="作りたい画面を入力（例: お問い合わせフォームのカード）"
              rows={3}
              value={input}
            />
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-fg-mute text-xs">モデル</span>
                <Button
                  color="gray"
                  disabled={isBusy}
                  onClick={() => {
                    dispatch({ type: 'select-model', model: 'fugu' });
                  }}
                  size="sm"
                  variant={
                    state.selectedModel === 'fugu' ? 'solid' : 'skeleton'
                  }
                >
                  fugu
                </Button>
                <Button
                  color="gray"
                  disabled={isBusy}
                  onClick={() => {
                    dispatch({ type: 'select-model', model: 'fugu-ultra' });
                  }}
                  size="sm"
                  variant={
                    state.selectedModel === 'fugu-ultra' ? 'solid' : 'skeleton'
                  }
                >
                  ultra
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-fg-mute hidden text-xs lg:inline">
                  ⌘/Ctrl+Enter
                </span>
                <Button
                  color="primary"
                  disabled={isBusy || input.trim() === ''}
                  onAction={handleGenerate}
                  size="sm"
                  variant="solid"
                >
                  生成する
                </Button>
              </div>
            </div>
            {applyError === null ? (
              error === undefined ? null : (
                <span className="text-fg-error text-xs">
                  エラーが発生しました。再試行してください。
                </span>
              )
            ) : (
              <span className="text-fg-error text-xs leading-relaxed">
                {applyError} 「直して」と送ると修正します。
              </span>
            )}
          </div>
        </div>

        <div
          className={`min-h-0 min-w-0 flex-col overflow-hidden lg:flex ${
            mobileTab === 'chat' ? 'hidden' : 'flex'
          }`}
        >
          <div className="min-h-0 flex-1 overflow-hidden" ref={frameRef}>
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
