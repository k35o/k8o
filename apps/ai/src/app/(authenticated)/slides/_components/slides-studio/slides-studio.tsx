'use client';

import { useChat } from '@ai-sdk/react';
import { Button, ForkIcon, FullscreenIcon, IconButton } from '@k8ordo/ui';
import { DefaultChatTransport } from 'ai';
import type { UIMessage } from 'ai';
import { useTheme } from 'next-themes';
import { useMemo, useReducer, useRef, useState, useTransition } from 'react';

import type { HighlightFn } from '@/app/_components/highlighted-code';
import { DeckHighlightContext } from '@/app/_components/slide-deck';
import {
  createInitialGenerationState,
  generationReducer,
} from '@/features/generation/application/generation-store';
import { messageText } from '@/features/generation/application/message-text';
import { parseSlidesGeneration } from '@/features/generation/application/parse-slides-generation';
import { highlightGenerated } from '@/features/highlight/interface/actions';
import type { ProjectListItem } from '@/features/projects/application/projects';
import {
  forkSlidesProjectAction,
  loadSlidesProjectAction,
  saveSlidesGenerationAction,
} from '@/features/projects/interface/actions';
import { parseDeck } from '@/features/slides/application/parse-deck';

import { ChatPanel } from '../../../_components/chat-panel';
import { CodePanel } from '../../../_components/code-panel';
import { CopyCodeButton } from '../../../_components/copy-code-button';
import { PreviewLoading } from '../../../_components/preview-loading';
import {
  useProjectPersistence,
  useProjectUrlSync,
} from '../../../_components/project-persistence';
import { ProjectTitle } from '../../../_components/project-title';
import { StudioPanes } from '../../../_components/studio-panes';
import { ToolHeader } from '../../../_components/tool-frame';
import { ViewTabs } from '../../../_components/view-tabs';
import { DeckPreview } from '../deck-preview';
import {
  MOBILE_TAB_OPTIONS,
  NEW_PROJECT_EMPTY_STATE,
  VIEW_OPTIONS,
} from './new-project';

import styles from './slides-studio.module.css';

// 設定は完全に静的なので、レンダーごとに生成しない。
const transport = new DefaultChatTransport({ api: '/api/generate' });

const persistenceActions = {
  save: saveSlidesGenerationAction,
  fork: forkSlidesProjectAction,
};

type PanelView = 'preview' | 'source';

// 吹き出しに出す説明文。スライドの出力フォーマット（md + json）から抽出する。
const describeSlidesMessage = (text: string): string | null =>
  parseSlidesGeneration(text).meta?.description ?? null;

export const SlidesStudio = ({ projects }: { projects: ProjectListItem[] }) => {
  const [input, setInput] = useState('');
  const [state, dispatch] = useReducer(
    generationReducer<string>,
    createInitialGenerationState<string>(),
  );
  const [view, setView] = useState<PanelView>('preview');
  // 小画面では2ペインを並べられないので、タブで1つずつ表示する。
  const [mobileTab, setMobileTab] = useState<'chat' | PanelView>('chat');
  // 履歴/フォーク選択の読込中。押した直後に「読み込み中」を見せて無反応に見えるのを防ぐ。
  const [pendingSelect, setPendingSelect] = useState<{ title: string } | null>(
    null,
  );
  const frameRef = useRef<HTMLDivElement>(null);
  // 直近の指示。onFinish（一度きりのクロージャ）から版に保存して会話復元に使う。
  const lastPromptRef = useRef('');
  // 版の保存（DB 往復）が完了するまで次の生成をブロックする。useChat の status は
  // onFinish の前に ready へ戻るため、この間に次を送ると projectId 未確定のまま
  // 別プロジェクトへ分裂して保存されてしまう。
  const [saving, startSaving] = useTransition();
  const persistence = useProjectPersistence<{ source: string }>(
    persistenceActions,
    '/slides',
  );
  const { resolvedTheme } = useTheme();
  // コードブロックのハイライトはアプリのテーマに合わせる（light は one-light、dark は plastic）。
  // テーマ解決前（SSR直後）は null にして、無駄な取得と取り直しを避ける。
  const deckHighlight = useMemo<HighlightFn | null>(() => {
    if (resolvedTheme !== 'light' && resolvedTheme !== 'dark') {
      return null;
    }
    const theme = resolvedTheme;
    return (blocks) => highlightGenerated(blocks, theme);
  }, [resolvedTheme]);

  const { messages, sendMessage, status, error, setMessages, stop } = useChat({
    transport,
    onFinish: ({ message, isAbort }) => {
      // 生成中に別プロジェクトへ切り替えた等で中断された場合は、切替先へ結果を
      // 適用/保存しないよう即座に抜ける。
      if (isAbort) {
        return;
      }
      const { source, meta } = parseSlidesGeneration(messageText(message));
      if (source !== null && meta !== null) {
        // generation-store は ui-studio と共用しており、current にデッキの
        // Markdown ソースを入れる。
        dispatch({
          type: 'generation-finished',
          content: source,
          meta,
        });
        // prompt も版に残し、履歴から読み込んだときに会話を復元できるようにする。
        // 保存が終わるまで saving（transition）が続き、次の生成の割り込みを防ぐ。
        startSaving(async () => {
          try {
            await persistence.save({
              source,
              meta,
              prompt: lastPromptRef.current,
            });
          } catch (saveError) {
            console.error('版の保存に失敗しました', saveError);
          }
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
  const deckSource = isBusy ? streamingSource : state.current;
  // ソース表示は生成中の書きかけ→確定版の順で新しいものを出す（ui-studio と同じ）。
  const displayedSource = isBusy
    ? (streamingSource ?? state.current)
    : state.current;
  const hasResult = state.current !== null;
  // 履歴から読み込んだ直後はチャットが空になるため、空状態でも「何を編集中か」を示す。
  const emptyStateTitle = hasResult
    ? `「${state.lastMeta?.title ?? 'スライド'}」を編集中`
    : NEW_PROJECT_EMPTY_STATE.title;
  const emptyStateHint = hasResult
    ? '続けて指示すると、このスライドを更新します。例:「もっと簡潔に」「コード例を追加して」'
    : NEW_PROJECT_EMPTY_STATE.hint;
  const chatErrorText =
    error === undefined ? null : 'エラーが発生しました。再試行してください。';
  // 初回（まだ結果がない）ときだけ、最初の一手を促すサジェストを出す。
  const promptSuggestions = hasResult
    ? []
    : NEW_PROJECT_EMPTY_STATE.suggestions;

  const handleGenerate = async (text: string): Promise<void> => {
    if (text === '' || isBusy || saving) {
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
          currentFile: state.current,
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

  const resetProject = (): void => {
    // 生成中なら中断してから切り替える（生成中表示が新プロジェクトに残るのを防ぐ）。
    void stop();
    persistence.reset();
    dispatch({ type: 'reset' });
    setMessages([]);
    setPendingSelect(null);
    setView('preview');
    setMobileTab('chat');
  };

  const handleSelectProject = async (id: number): Promise<void> => {
    const isLatest = persistence.startLoading(id);
    // 生成中なら中断してから切り替える（生成中表示が切替先に漏れるのを防ぐ）。
    void stop();
    const known = projects.find((project) => project.id === id);
    setPendingSelect({ title: known?.title ?? '読み込み中…' });
    setView('preview');
    setMobileTab('preview');
    // 読込が終わったら（成功/失敗/非所有いずれも）読込中表示を外す。待つあいだに別のプロジェクトへ
    // 移っていたら、移った先の読込中表示は移った先の読込が外す。
    // 例外も読めなかった（null）ときと同じに扱い、向かっていた先を今のプロジェクトに戻す。
    // 戻さないと、そのあとの保存が別のプロジェクトへ移ったものとして捨てられる
    const project = await loadSlidesProjectAction(id)
      .catch((loadError: unknown) => {
        console.error('スライドを読み込めませんでした', loadError);
        return null;
      })
      .finally(() => {
        if (isLatest()) {
          setPendingSelect(null);
        }
      });
    // 待つあいだに別のプロジェクトへ移っていたら、移った先を上書きしないよう捨てる。
    if (!isLatest()) {
      return;
    }
    persistence.markLoaded(project);
    if (project === null) {
      return;
    }
    dispatch({
      type: 'load-project',
      content: project.source,
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
  };

  const handleFork = async (): Promise<void> => {
    if (persistence.projectId === null) {
      return;
    }
    await persistence.fork(persistence.projectId);
  };

  useProjectUrlSync(persistence.isHeadingTo, {
    load: (projectId) => {
      void handleSelectProject(projectId);
    },
    reset: resetProject,
  });

  return (
    <>
      <ToolHeader>
        <ProjectTitle
          newProjectLabel="新しいスライド"
          pendingTitle={pendingSelect?.title ?? null}
          projectId={persistence.projectId}
          projectTitle={persistence.projectTitle}
        />
        <div className={styles.viewTabs}>
          <ViewTabs onChange={setView} options={VIEW_OPTIONS} value={view} />
        </div>
        <div className={styles.actions}>
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
          <div className={styles.desktopActions}>
            <Button
              color="base"
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
        </div>
      </ToolHeader>
      <div className={styles.mobileTabs}>
        <ViewTabs
          onChange={(tab) => {
            setMobileTab(tab);
            if (tab !== 'chat') {
              setView(tab);
            }
          }}
          options={MOBILE_TAB_OPTIONS}
          value={mobileTab}
        />
      </div>

      <StudioPanes
        chat={
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
        }
        mobilePane={mobileTab === 'chat' ? 'chat' : 'panel'}
        panel={
          <div className={styles.frame} ref={frameRef}>
            <div className={styles.preview} data-active={view === 'preview'}>
              {/* コードブロックのハイライト（server action）はここで注入する。
                  UI 側で直接 import すると Storybook が DB まで辿ってしまうため。 */}
              <DeckHighlightContext value={deckHighlight}>
                <DeckPreview
                  isStreaming={isBusy}
                  key={persistence.projectId ?? 'new'}
                  source={deckSource}
                />
              </DeckHighlightContext>
              {/* 履歴/フォーク選択の読込中オーバーレイ。 */}
              {pendingSelect === null ? null : (
                <PreviewLoading message="スライドを読み込んでいます…" />
              )}
            </div>
            <div className={styles.source} data-active={view === 'source'}>
              <CodePanel
                code={displayedSource}
                emptyText="ここに生成されたスライドの Markdown が表示されます"
                isStreaming={isBusy}
                lang="markdown"
              />
            </div>
          </div>
        }
      />
    </>
  );
};
