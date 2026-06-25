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
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';

import { ThemedPreviewIframe } from '@/app/_components/preview-iframe';
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
import { loadProjectAndApplyAction } from '@/features/projects/interface/actions';

import { StreamPreview } from '../stream-preview';
import { ChatMessage } from './chat-message';
import { CodePanel } from './code-panel';
import { CopyCodeButton } from './copy-code-button';
import { PreviewLoading } from './preview-loading';
import { ProjectHistory } from './project-history';
import { ShareControl } from './share-control';
import { useStudioPersistence } from './use-studio-persistence';

type PanelView = 'preview' | 'code';

// HMR でプレビューが差し替わるのを待つ猶予。これを過ぎても iframe から反映通知が来なければ
// 強制リロードへフォールバックする（websocket が張れず HMR が効かない環境向けの保険）。
const PREVIEW_HMR_FALLBACK_MS = 2000;

export const Studio = () => {
  const [input, setInput] = useState('');
  const [state, dispatch] = useReducer(
    generationReducer,
    initialGenerationState,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewNonce, setPreviewNonce] = useState(0);
  // プレビューへの反映〜iframe 読み込み完了までを覆うローディング。完了は iframe の onLoad で外す。
  const [previewLoading, setPreviewLoading] = useState(false);
  // 環境（Sandbox）の用意に失敗したとき。スピナーが回り続けないよう案内に切り替える。
  const [previewFailed, setPreviewFailed] = useState(false);
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
  // HMR 反映待ちのフォールバック用タイマー。反映通知が来れば張り替えず解除する。
  const reloadFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearReloadFallback = useCallback((): void => {
    if (reloadFallbackRef.current !== null) {
      clearTimeout(reloadFallbackRef.current);
      reloadFallbackRef.current = null;
    }
  }, []);
  // コード反映後の表示更新。まず HMR の差分反映（iframe からの updated 通知）を待ち、猶予内に
  // 来なければ iframe を貼り替えて強制リロードする。前者なら白フラッシュなしで即時に切り替わる。
  const reflectPreview = useCallback((): void => {
    setPreviewLoading(true);
    clearReloadFallback();
    reloadFallbackRef.current = setTimeout(() => {
      reloadFallbackRef.current = null;
      setPreviewNonce((nonce) => nonce + 1);
    }, PREVIEW_HMR_FALLBACK_MS);
  }, [clearReloadFallback]);
  // iframe（プレビュー）から HMR 反映通知が来たとき。安定参照にして iframe 側の購読を毎レンダー張り替えない。
  const handlePreviewUpdated = useCallback((): void => {
    clearReloadFallback();
    setPreviewLoading(false);
  }, [clearReloadFallback]);
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
          code: parsed.code,
          meta: parsed.meta,
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
          // 反映〜iframe 読み込み完了までローディングを出す（プレビュー表示が遅れても状態が分かるように）。
          setPreviewLoading(true);
          const res = await applyPreviewCode(parsed.code);
          if (res.ok) {
            setApplyError(null);
            reflectPreview();
            setView('preview');
            setMobileTab('preview');
            return;
          }
          // 反映に失敗したら HMR もリロードも起きないので、ローディングはここで外す。
          clearReloadFallback();
          setPreviewLoading(false);
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

  // 起動時にプレビューセッション（Sandbox）を用意する。失敗時は無限スピナーにせず案内を出す。
  useEffect(() => {
    void (async () => {
      try {
        const res = await startPreviewSession();
        if (res === null) {
          setPreviewFailed(true);
        } else {
          setPreviewUrl(res.url);
        }
      } catch {
        setPreviewFailed(true);
      }
    })();
  }, []);

  // アンマウント時に HMR フォールバックのタイマーを始末する。
  useEffect(
    () => () => {
      if (reloadFallbackRef.current !== null) {
        clearTimeout(reloadFallbackRef.current);
      }
    },
    [],
  );

  // 末尾追従は「メッセージ追加」「生成状態の変化」の節目だけにする。messages 全体を依存に
  // すると生成中は毎トークン smooth スクロールが連打されてもたつくため、件数と status で間引く。
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, status]);

  const lastAssistant = messages.findLast(
    (message) => message.role === 'assistant',
  );
  // 生成中表示は「会話の最後のメッセージ」だけに付ける。submitted 中はまだ assistant が
  // 増えていない（最後は user メッセージ）ので、直前ターンの回答が「考え中」に化けない。
  const lastMessageId = messages.at(-1)?.id;
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
    ? `「${state.lastMeta?.title ?? 'プロジェクト'}」を編集中`
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
    // 直前の反映待ちタイマーが生成中にリロードを起こさないよう始末する。
    clearReloadFallback();
    // 生成中は途中コードを先行プレビュー（StreamPreview）で逐次描画して見せる。完了で
    // onFinish が実コンパイル版（iframe）へ切り替える。モバイルはチャットの「考えています…」を
    // 残したいので mobileTab は切り替えない。
    setView('preview');
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
    // 直前の反映待ちタイマーが新プロジェクトでリロードを起こさないよう始末する。
    clearReloadFallback();
    setPreviewLoading(false);
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
    // 読込（DB）と反映（Sandbox）を1サーバー往復にまとめ、往復・認証を半減する。
    const result = await loadProjectAndApplyAction(id);
    if (result === null) {
      return;
    }
    const { project, applied } = result;
    persistence.markLoaded(project);
    dispatch({
      type: 'load-project',
      code: project.code,
      meta: project.meta,
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
    if (applied.ok) {
      // 反映済み。HMR の差分反映を待ち、来なければリロードへフォールバックする。
      reflectPreview();
      setView('preview');
      setMobileTab('preview');
    }
    // 反映失敗（保存済みコードでは稀）時はプレビューを前版のまま据え置く。
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
                  // 生成中の最後の assistant だけは実況（毎トークン変化）を出す。これ以外の
                  // 確定メッセージは memo 済みの ChatMessage に委ね、履歴の再パースを避ける。
                  const working =
                    isBusy &&
                    message.id === lastMessageId &&
                    message.role === 'assistant';
                  if (working) {
                    return (
                      <div className="flex flex-col gap-1.5" key={message.id}>
                        <span className="text-fg-mute text-xs font-bold">
                          AI
                        </span>
                        <p className="text-fg-mute text-sm leading-relaxed motion-safe:animate-pulse">
                          {generatingStatus}
                        </p>
                      </div>
                    );
                  }
                  return <ChatMessage key={message.id} message={message} />;
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
            <div className={view === 'preview' ? 'relative h-full' : 'hidden'}>
              {previewFailed ? (
                <div className="text-fg-mute flex h-full items-center justify-center p-6 text-center text-sm leading-relaxed">
                  プレビュー環境を準備できませんでした。ページを再読み込みしてください。
                </div>
              ) : previewUrl === null ? (
                // サンドボックスの起動待ち（cold start）。ここが遅いことが多いので明示する。
                <PreviewLoading message="プレビュー環境を準備しています…" />
              ) : hasResult ? (
                <>
                  <ThemedPreviewIframe
                    key={previewNonce}
                    onLoad={() => {
                      clearReloadFallback();
                      setPreviewLoading(false);
                    }}
                    onUpdated={handlePreviewUpdated}
                    theme={resolvedTheme}
                    title="preview"
                    url={previewUrl}
                  />
                  {previewLoading ? (
                    <PreviewLoading message="プレビューを反映しています…" />
                  ) : null}
                </>
              ) : (
                <div className="text-fg-mute flex h-full items-center justify-center p-6 text-center text-sm leading-relaxed">
                  生成すると、ここにライブプレビューが表示されます
                </div>
              )}
              {/* 生成中〜反映確定までは、途中コードをホスト側で逐次描画した先行プレビューを
                  iframe の上に重ねる。Sandbox の cold start や HMR 反映を待たずに構造が見え、
                  反映が確定（previewLoading=false かつ生成完了）すると外れて実 iframe が出る。
                  iframe は下で読み込み継続するため onLoad/HMR 通知の経路は壊さない。 */}
              {streamingCode !== null && (isBusy || previewLoading) ? (
                <div className="bg-bg-base absolute inset-0 overflow-auto">
                  <StreamPreview code={streamingCode} />
                </div>
              ) : null}
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
