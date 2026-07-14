'use client';

import { useChat } from '@ai-sdk/react';
import {
  Button,
  ForkIcon,
  FullscreenIcon,
  IconButton,
} from '@k8o/arte-odyssey';
import { DefaultChatTransport } from 'ai';
import type { UIMessage } from 'ai';
import { useTheme } from 'next-themes';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';

import type { HighlightFn } from '@/app/_components/highlighted-code';
import { DeckHighlightContext } from '@/app/_components/slide-deck';
import { ToggleTheme } from '@/app/_components/toggle-theme';
import {
  generationReducer,
  initialGenerationState,
} from '@/features/generation/application/generation-store';
import { messageText } from '@/features/generation/application/parse-generation';
import { parseSlidesGeneration } from '@/features/generation/application/parse-slides-generation';
import { highlightGenerated } from '@/features/highlight/interface/actions';
import { loadSlidesProjectAction } from '@/features/projects/interface/actions';
import { parseDeck } from '@/features/slides/application/parse-deck';

import { ChatPanel } from '../../../_components/studio/chat-panel';
import { CopyCodeButton } from '../../../_components/studio/copy-code-button';
import { PreviewLoading } from '../../../_components/studio/preview-loading';
import { ProjectHistory } from '../../../_components/studio/project-history';
import { ToolNav } from '../../../_components/tool-nav';
import { DeckPreview } from '../deck-preview';
import { SourcePanel } from './source-panel';
import { useSlidesPersistence } from './use-slides-persistence';

type PanelView = 'preview' | 'source';

// 吹き出しに出す説明文。スライドの出力フォーマット（md + json）から抽出する。
const describeSlidesMessage = (text: string): string | null =>
  parseSlidesGeneration(text).meta?.description ?? null;

export const SlidesStudio = () => {
  const [input, setInput] = useState('');
  const [state, dispatch] = useReducer(
    generationReducer,
    initialGenerationState,
  );
  const [view, setView] = useState<PanelView>('preview');
  // 小画面では2ペインを並べられないので、タブで1つずつ表示する。
  const [mobileTab, setMobileTab] = useState<'chat' | 'preview' | 'source'>(
    'chat',
  );
  const [historyOpen, setHistoryOpen] = useState(false);
  // 履歴/フォーク選択の読込中。押した直後に「読み込み中」を見せて無反応に見えるのを防ぐ。
  const [pendingSelect, setPendingSelect] = useState<{ title: string } | null>(
    null,
  );
  const frameRef = useRef<HTMLDivElement>(null);
  // 直近の指示。onFinish（一度きりのクロージャ）から版に保存して会話復元に使う。
  const lastPromptRef = useRef('');
  const persistence = useSlidesPersistence();
  const { resolvedTheme } = useTheme();
  // コードブロックのハイライトはアプリのテーマに合わせる（light は one-light、dark は plastic）。
  // テーマ解決前（SSR直後）は null にして、無駄な取得と取り直しを避ける。
  const deckHighlight = useMemo<HighlightFn | null>(() => {
    if (resolvedTheme !== 'light' && resolvedTheme !== 'dark') {
      return null;
    }
    const theme = resolvedTheme;
    return (code, lang) => highlightGenerated(code, lang, theme);
  }, [resolvedTheme]);
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
      // 適用/保存しないよう即座に抜ける。
      if (isAbort) {
        return;
      }
      const parsed = parseSlidesGeneration(messageText(message));
      if (parsed.source !== null && parsed.meta !== null) {
        // generation-store は ui-studio と共用しており、currentFile にデッキの
        // Markdown ソースを入れる。
        dispatch({
          type: 'generation-finished',
          code: parsed.source,
          meta: parsed.meta,
        });
        // prompt も版に残し、履歴から読み込んだときに会話を復元できるようにする。
        void persistence.save({
          source: parsed.source,
          meta: parsed.meta,
          prompt: lastPromptRef.current,
        });
        setView('preview');
        setMobileTab('preview');
      }
    },
  });

  const isBusy = status === 'submitted' || status === 'streaming';

  const lastAssistant = messages.findLast(
    (message) => message.role === 'assistant',
  );
  const streamingSource =
    lastAssistant === undefined
      ? null
      : parseSlidesGeneration(messageText(lastAssistant)).source;
  const streamingSlides = useMemo(
    () => (streamingSource === null ? 0 : parseDeck(streamingSource).length),
    [streamingSource],
  );
  const slideSuffix =
    streamingSlides > 0 ? `（${streamingSlides.toString()} 枚目）` : '';
  const generatingStatus =
    status === 'submitted'
      ? '考えています…'
      : `スライドを生成しています…${slideSuffix}`;
  // プレビューは生成中なら書きかけのデッキを逐次描画し、それ以外は確定版を出す。
  const deckSource = isBusy ? streamingSource : state.currentFile;
  // ソース表示は生成中の書きかけ→確定版の順で新しいものを出す（ui-studio と同じ）。
  const displayedSource = isBusy
    ? (streamingSource ?? state.currentFile)
    : state.currentFile;
  const hasResult = state.currentFile !== null;
  // 履歴から読み込んだ直後はチャットが空になるため、空状態でも「何を編集中か」を示す。
  const emptyStateTitle = hasResult
    ? `「${state.lastMeta?.title ?? 'スライド'}」を編集中`
    : 'スライドを生成しましょう';
  const emptyStateHint = hasResult
    ? '続けて指示すると、このスライドを更新します。例:「もっと簡潔に」「コード例を追加して」'
    : '例: 「TypeScript 入門の LT スライド」「自己紹介の5枚デッキ」';
  const chatErrorText =
    error === undefined ? null : 'エラーが発生しました。再試行してください。';
  // 初回（まだ結果がない）ときだけ、最初の一手を促すサジェストを出す。
  const promptSuggestions = hasResult
    ? []
    : [
        'TypeScript 入門の LT スライド',
        'モノレポ運用の勉強会資料',
        '自己紹介の5枚デッキ',
      ];

  const handleGenerate = async (text: string): Promise<void> => {
    if (text === '' || isBusy) {
      return;
    }
    setInput('');
    // 生成中は書きかけのデッキを DeckPreview が逐次描画する。モバイルはチャットの
    // 「考えています…」を残したいので mobileTab は切り替えない。
    setView('preview');
    lastPromptRef.current = text;
    await sendMessage(
      { text },
      {
        body: {
          mode: 'slides',
          currentFile: state.currentFile,
          model: state.selectedModel,
        },
      },
    );
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
    setHistoryOpen(false);
    setPendingSelect(null);
    setView('preview');
    setMobileTab('chat');
    router.replace('/slides');
  };

  const handleSelectProject = async (id: number): Promise<void> => {
    // 生成中なら中断してから切り替える（生成中表示が切替先に漏れるのを防ぐ）。
    void stop();
    setHistoryOpen(false);
    const known = persistence.projects.find((project) => project.id === id);
    setPendingSelect({ title: known?.title ?? '読み込み中…' });
    setView('preview');
    setMobileTab('preview');
    try {
      const project = await loadSlidesProjectAction(id);
      if (project === null) {
        return;
      }
      persistence.markLoaded(project);
      dispatch({
        type: 'load-project',
        code: project.source,
        meta: project.meta,
      });
      // 履歴を切り替えてもトークが消えないよう会話を復元する。各版を
      // [user(指示) → assistant(meta JSON)] に展開し、assistant は json フェンスに
      // することで describeSlidesMessage が説明文を抽出できる。
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
    } finally {
      // 読込が終わったら（成功/失敗/非所有いずれも）読込中表示を必ず外す。
      setPendingSelect(null);
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
  // （初期 / boot 中 / 新規）は書き換えない。新規化での「/slides」戻しは handleNewProject で行う。
  useEffect(() => {
    if (persistence.projectId === null) {
      return;
    }
    router.replace(`/slides?project=${persistence.projectId.toString()}`);
  }, [persistence.projectId, router]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ProjectHistory
        currentProjectId={persistence.projectId}
        emptyText="まだ保存されたスライドはありません。生成すると自動で履歴に残ります。"
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
          <ToolNav current="/slides" />
          <span className="text-fg-mute shrink-0 text-sm">/</span>
          {pendingSelect === null ? (
            persistence.projectId === null ? (
              <span className="text-fg-mute truncate text-sm">
                新しいスライド
              </span>
            ) : (
              <span className="text-fg-base truncate text-sm font-medium">
                {persistence.projectTitle ?? '無題'}
              </span>
            )
          ) : (
            // 読込中は選んだプロジェクト名を先行表示し、クリックが効いたことを示す。
            <span className="text-fg-base truncate text-sm font-medium">
              {pendingSelect.title}
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
              setView('source');
            }}
            size="sm"
            variant={view === 'source' ? 'solid' : 'skeleton'}
          >
            ソース
          </Button>
        </div>
        <div className="flex shrink-0 items-center gap-2 lg:ml-auto">
          {persistence.projectId === null ? null : (
            <IconButton
              color="base"
              label="フォーク"
              onAction={handleFork}
              size="sm"
            >
              <ForkIcon size="sm" />
            </IconButton>
          )}
          <div className="hidden items-center gap-3 lg:flex">
            <Button
              color="gray"
              disabled={!hasResult}
              onClick={() => {
                // DeckPreview が @media print 用に全スライドを描画済み（DeckPrint）。
                window.print();
              }}
              size="sm"
              variant="outline"
            >
              PDF出力
            </Button>
            <CopyCodeButton code={hasResult ? displayedSource : null} />
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
            setMobileTab('source');
            setView('source');
          }}
          size="sm"
          variant={mobileTab === 'source' ? 'solid' : 'skeleton'}
        >
          ソース
        </Button>
      </div>

      {/* grid-rows-1 で単一ペインも本体高さを満たす（小画面でメッセージがスクロールするように）。 */}
      <div className="grid min-h-0 flex-1 grid-rows-1 lg:grid-cols-[440px_minmax(0,1fr)]">
        <div
          className={`border-border-mute min-h-0 min-w-0 flex-col lg:flex lg:border-r ${
            mobileTab === 'chat' ? 'flex' : 'hidden'
          }`}
        >
          <ChatPanel
            describeMessage={describeSlidesMessage}
            emptyStateHint={emptyStateHint}
            emptyStateTitle={emptyStateTitle}
            errorText={chatErrorText}
            generatingStatus={generatingStatus}
            input={input}
            inputPlaceholder="作りたいスライドを入力（例: TypeScript 入門の LT 資料）"
            messages={messages}
            onInputChange={setInput}
            onSelectModel={(model) => {
              dispatch({ type: 'select-model', model });
            }}
            onStop={() => {
              void stop();
            }}
            onSubmit={(text) => {
              void handleGenerate(text);
            }}
            selectedModel={state.selectedModel}
            status={status}
            suggestions={promptSuggestions}
          />
        </div>

        <div
          className={`min-h-0 min-w-0 flex-col overflow-hidden lg:flex ${
            mobileTab === 'chat' ? 'hidden' : 'flex'
          }`}
        >
          <div className="min-h-0 flex-1 overflow-hidden" ref={frameRef}>
            <div
              className={
                view === 'preview' ? 'bg-bg-surface relative h-full' : 'hidden'
              }
            >
              {/* コードブロックのハイライト（server action）はここで注入する。
                  UI 側で直接 import すると Storybook が DB まで辿ってしまうため。 */}
              <DeckHighlightContext.Provider value={deckHighlight}>
                <DeckPreview
                  isStreaming={isBusy}
                  key={persistence.projectId ?? 'new'}
                  source={deckSource}
                />
              </DeckHighlightContext.Provider>
              {/* 履歴/フォーク選択の読込中オーバーレイ。 */}
              {pendingSelect === null ? null : (
                <PreviewLoading message="スライドを読み込んでいます…" />
              )}
            </div>
            <div className={view === 'source' ? 'h-full' : 'hidden'}>
              <SourcePanel isStreaming={isBusy} source={displayedSource} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
