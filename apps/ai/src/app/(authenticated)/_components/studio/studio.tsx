'use client';

/* oxlint-disable import/max-dependencies -- Studio はチャット/生成/プレビュー/履歴を束ねる統合点。
   プレビュー列(PreviewPane)やフックへの更なる分解は別タスクの余地として許容する。 */

import { useChat } from '@ai-sdk/react';
import { Button, Heading, Textarea } from '@k8o/arte-odyssey';
import { DefaultChatTransport, type UIMessage } from 'ai';
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

import { ToggleTheme } from '../toggle-theme';
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
  // 小画面では2ペインを並べられないので、チャット/プレビュー/コードをタブで1つずつ表示する。
  const [mobileTab, setMobileTab] = useState<'chat' | 'preview' | 'code'>(
    'chat',
  );
  const [applyError, setApplyError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  // 直近に送った指示。onFinish（一度きりのクロージャ）から版に保存し、会話復元に使う。
  const lastPromptRef = useRef('');
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
        // prompt も版に残し、履歴から読み込んだときに会話を復元できるようにする。
        void persistence.save({
          code: parsed.code,
          meta: parsed.meta,
          prompt: lastPromptRef.current,
        });
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
            setMobileTab('preview');
            return;
          }
          // 不正 import 等で反映できなかった。エラーを次ターンの system に流して自動修復を促し、
          // ユーザーにも提示する（プレビューは前回の正常版のまま＝白画面にしない）。
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
  // 生成中に「何をしているか」を段階表示する（送信直後=考え中 / ストリーミング中=生成中+行数）。
  const generatingStatus =
    status === 'submitted'
      ? '考えています…'
      : `UI を生成しています…${lineSuffix}`;
  const displayedCode = isBusy
    ? (streamingCode ?? state.currentFile)
    : state.currentFile;
  const hasResult = state.currentFile !== null;
  // 履歴から読み込んだ直後はチャットが空になるため、空状態でも「何を編集中か」を示す
  // （汎用プロンプトのままだと新規開始のように見えてトークが消えたと感じる）。
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
    persistence.reset();
    dispatch({ type: 'reset' });
    setMessages([]);
    setApplyError(null);
    setHistoryOpen(false);
    setView('preview');
    setMobileTab('chat');
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
    // 会話を復元する（履歴を切り替えてもトークが消えないように）。各版を
    // [user(指示) → assistant(meta JSON)] に展開。assistant は json フェンスにすることで
    // 既存の描画ロジック（parseGeneration の description 抽出）でそのまま説明文が出る。
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

  return (
    <div className="flex flex-col gap-6 lg:min-h-0 lg:flex-1">
      {/* アプリヘッダー: 識別と、現在のプロジェクトに依らないグローバル操作
          （履歴=過去プロジェクトへのナビ / 新規=新規作成）だけを置く。 */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Heading type="h1">k8o AI Studio</Heading>
          <p className="text-fg-mute text-sm leading-relaxed">
            作りたい画面を伝えると、arte-odyssey で UI を生成します。
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
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

      {/* 現在のプロジェクトのツールバー: 操作対象を明示し、そのプロジェクトに対する
          操作（共有・フォーク）をグローバル操作と分けてまとめる。未保存時は出さない。 */}
      {persistence.projectId === null ? null : (
        <div className="bg-bg-base border-border-mute flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-2.5 shadow-sm">
          <div className="flex min-w-0 flex-col">
            <span className="text-fg-mute text-xs">現在のプロジェクト</span>
            <span className="text-fg-base truncate text-sm font-bold">
              {persistence.projectTitle ?? '無題'}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
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
            <Button
              color="gray"
              onAction={handleFork}
              size="sm"
              variant="outline"
            >
              フォーク
            </Button>
          </div>
        </div>
      )}

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

      {/* 小画面用タブ: 2ペインを並べられないのでチャット/プレビュー/コードを1つずつ表示。
          lg では2ペイン（チャット ＋ プレビュー/コード）を並べるので不要。 */}
      <div className="flex gap-2 lg:hidden">
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

      <div className="grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[440px_minmax(0,1fr)] lg:grid-rows-1">
        {/* チャット（lg では常時表示、小画面では mobileTab==='chat' のときのみ） */}
        <div
          className={`bg-bg-base border-border-mute h-136 min-w-0 flex-col rounded-2xl border shadow-sm lg:flex lg:h-full ${
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
          </div>
        </div>

        {/* プレビュー / コード（lg では常時表示、小画面では mobileTab!=='chat' のとき） */}
        <div
          className={`h-136 min-w-0 flex-col gap-3 lg:flex lg:h-full ${
            mobileTab === 'chat' ? 'hidden' : 'flex'
          }`}
        >
          <div className="flex items-center gap-2">
            {/* プレビュー/コードの切替は lg のみ（小画面では上部タブが担うので隠す）。 */}
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
            <div className="ml-auto flex items-center gap-3">
              <CopyCodeButton code={hasResult ? displayedCode : null} />
              <Button
                color="gray"
                disabled={!hasResult}
                onClick={handleFullscreen}
                size="sm"
                variant="outline"
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
