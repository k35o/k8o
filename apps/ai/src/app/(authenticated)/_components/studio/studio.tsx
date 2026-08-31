'use client';

import { useChat } from '@ai-sdk/react';
import type { Spec } from '@json-render/core';
import { ForkIcon, FullscreenIcon, IconButton } from '@k8ordo/ui';
import { validateGeneratedSpec } from '@k8ordo/ui/json-render';
import { DefaultChatTransport } from 'ai';
import type { UIMessage } from 'ai';
import { useRouter } from 'next/navigation';
import { useMemo, useReducer, useRef, useState, useTransition } from 'react';

import { SpecPreview } from '@/app/_components/spec-preview';
import {
  createInitialGenerationState,
  generationReducer,
} from '@/features/generation/application/generation-store';
import { messageText } from '@/features/generation/application/message-text';
import {
  countElements,
  hasSpecParts,
  parseSpecProse,
  specFromMessage,
  toSpec,
  usedComponentTypes,
} from '@/features/generation/application/spec-message';
import { specToTsx } from '@/features/generation/application/spec-to-tsx';
import type { ProjectListItem } from '@/features/projects/application/projects';
import {
  forkProjectAction,
  listProjectsAction,
  loadProjectAction,
  saveGenerationAction,
} from '@/features/projects/interface/actions';

import { ChatPanel } from '../chat-panel';
import { CodePanel } from '../code-panel';
import { CopyCodeButton } from '../copy-code-button';
import { PreviewLoading } from '../preview-loading';
import {
  useProjectPersistence,
  useProjectUrlSync,
} from '../project-persistence';
import { ProjectTitle } from '../project-title';
import { StudioPanes } from '../studio-panes';
import { StudioShell } from '../studio-shell';
import { ViewTabs } from '../view-tabs';
import { ShareControl } from './share-control';

// 設定は完全に静的なので、レンダーごとに生成しない。
const transport = new DefaultChatTransport({ api: '/api/generate' });

const persistenceActions = {
  list: listProjectsAction,
  save: saveGenerationAction,
  fork: forkProjectAction,
};

type PanelView = 'preview' | 'spec' | 'tsx';

const viewOptions = [
  { value: 'preview', label: 'プレビュー' },
  { value: 'spec', label: 'spec' },
  { value: 'tsx', label: 'TSX' },
] as const;

const mobileTabOptions = [
  { value: 'chat', label: 'チャット' },
  ...viewOptions,
] as const;

export const Studio = ({
  initialProjects,
}: {
  initialProjects: ProjectListItem[];
}) => {
  const [input, setInput] = useState('');
  const [state, dispatch] = useReducer(
    generationReducer<Spec>,
    createInitialGenerationState<Spec>(),
  );
  const [view, setView] = useState<PanelView>('preview');
  // 小画面では2ペインを並べられないので、タブで1つずつ表示する。
  const [mobileTab, setMobileTab] = useState<'chat' | PanelView>('chat');
  // 生成結果が catalog 検証に落ちたときの案内（チャット下部に出す）。
  const [validationNotice, setValidationNotice] = useState<string | null>(null);
  // 履歴/フォーク選択の読込中。押した直後に「読み込み中」を見せて無反応に見えるのを防ぐ。
  const [pendingSelect, setPendingSelect] = useState<{ title: string } | null>(
    null,
  );
  const frameRef = useRef<HTMLDivElement>(null);
  // 直近の指示。onFinish（一度きりのクロージャ）から版に保存して会話復元に使う。
  const lastPromptRef = useRef('');
  // パッチ適用の土台。生成開始時点の spec に固定し、ストリーミング描画と onFinish の
  // 双方から同じ土台へ適用する（適用後の spec を土台にすると二重適用が起きるため）。
  // レンダー中に読むので ref ではなく state に持つ。
  const [editBase, setEditBase] = useState<Spec | null>(null);
  // 版の保存（DB 往復）が完了するまで次の生成をブロックする。useChat の status は
  // onFinish の前に ready へ戻るため、この間に次を送ると projectId 未確定のまま
  // 別プロジェクトへ分裂して保存されてしまう。
  const [saving, startSaving] = useTransition();
  const persistence = useProjectPersistence<{ spec: Spec }>(
    persistenceActions,
    initialProjects,
  );
  const router = useRouter();

  const { messages, sendMessage, status, error, setMessages, stop } = useChat({
    transport,
    onFinish: ({ message, isAbort }) => {
      // 生成中に別プロジェクトへ切り替えた等で中断された場合は、切替先へ結果を
      // 適用/保存しないよう即座に抜ける（生成中表示の漏れや誤保存を防ぐ）。
      if (isAbort) {
        return;
      }
      const spec = specFromMessage(message, editBase);
      if (spec === null) {
        // spec パーツ自体が無ければ UI 変更のない会話応答（現状維持でよい）。
        // パーツはあるのに組み上がらなかった場合は適用失敗なので、無言で
        // 握り潰さず修復ループへ流す。
        if (hasSpecParts(message)) {
          setValidationNotice(
            '生成された UI を組み立てられませんでした。「直して」と送ると作り直します。',
          );
          dispatch({
            type: 'repair-needed',
            repairPrompt:
              '前回の出力はパッチとして適用できず、spec を組み立てられなかった。差分ではなく spec 全体を最初から出力し直すこと。',
          });
        }
        return;
      }
      const validated = validateGeneratedSpec(spec);
      // 検証エラーは修復指示を次ターンの system に流す（プレビューは前回の正常版のまま）。
      if (!validated.ok) {
        setValidationNotice(
          '生成された UI が検証エラーになりました。「直して」と送ると修正します。',
        );
        dispatch({
          type: 'repair-needed',
          repairPrompt: validated.repairPrompt,
        });
        return;
      }
      const finishedSpec = toSpec(validated.spec);
      const prose = parseSpecProse(messageText(message));
      const meta = {
        title: prose.title ?? '無題の UI',
        description: prose.description,
        usedComponents: usedComponentTypes(finishedSpec),
        changes: [],
      };
      dispatch({ type: 'generation-finished', content: finishedSpec, meta });
      // prompt も版に残し、履歴から読み込んだときに会話を復元できるようにする。
      // 保存が終わるまで saving（transition）が続き、次の生成の割り込みを防ぐ。
      startSaving(async () => {
        try {
          await persistence.save({
            spec: finishedSpec,
            meta,
            prompt: lastPromptRef.current,
          });
        } catch (saveError) {
          console.error('版の保存に失敗しました', saveError);
        }
      });
      setView('preview');
      setMobileTab('preview');
    },
  });

  const isBusy = status === 'submitted' || status === 'streaming';

  const lastAssistant = messages.findLast(
    (message) => message.role === 'assistant',
  );
  // ストリーミング中の書きかけ spec。パッチ到着ごとに土台から組み立て直す。
  const streamingSpec = useMemo(
    () =>
      lastAssistant === undefined
        ? null
        : specFromMessage(lastAssistant, editBase),
    [lastAssistant, editBase],
  );
  const streamingCount = countElements(streamingSpec);
  const countSuffix =
    streamingCount > 0 ? `（${streamingCount.toString()} 要素）` : '';
  const generatingStatus =
    status === 'submitted'
      ? '考えています…'
      : `UI を生成しています…${countSuffix}`;
  // プレビューは生成中なら書きかけの spec を逐次描画し、それ以外は確定版を出す。
  const displaySpec = isBusy ? (streamingSpec ?? state.current) : state.current;
  const specJson =
    displaySpec === null ? null : JSON.stringify(displaySpec, null, 2);
  // TSX への機械変換。TSX ビューを開いたときだけ計算する。
  const tsxCode = useMemo(
    () =>
      view === 'tsx' && displaySpec !== null ? specToTsx(displaySpec) : null,
    [view, displaySpec],
  );
  // コピー対象は見ているビューに合わせる（プレビュー中は生成物の実体である spec）。
  const displayedCode = view === 'tsx' ? tsxCode : specJson;
  const hasResult = state.current !== null;
  // 履歴から読み込んだ直後はチャットが空になるため、空状態でも「何を編集中か」を示す。
  const emptyStateTitle = hasResult
    ? `「${state.lastMeta?.title ?? 'プロジェクト'}」を編集中`
    : 'UI を生成しましょう';
  const emptyStateHint = hasResult
    ? '続けて指示すると、このUIを更新します。例:「色を温かいトーンに」「余白を広げて」'
    : '例: 「お問い合わせフォームのカード」「料金プランの3カラム」';
  let chatErrorText: string | null = null;
  if (validationNotice !== null) {
    chatErrorText = validationNotice;
  } else if (error !== undefined) {
    chatErrorText = 'エラーが発生しました。再試行してください。';
  }
  // 初回（まだ結果がない）ときだけ、最初の一手を促すサジェストを出す。
  const promptSuggestions = hasResult
    ? []
    : [
        'お問い合わせフォームのカード',
        '料金プランの3カラム',
        'ヒーローセクション',
      ];
  const currentProject =
    persistence.projects.find(
      (project) => project.id === persistence.projectId,
    ) ?? null;

  const handleGenerate = async (text: string): Promise<void> => {
    if (text === '' || isBusy || saving) {
      return;
    }
    setInput('');
    setValidationNotice(null);
    // 生成中は書きかけの spec を SpecPreview が逐次描画する。モバイルはチャットの
    // 「考えています…」を残したいので mobileTab は切り替えない。
    setView('preview');
    lastPromptRef.current = text;
    setEditBase(state.current);
    await sendMessage(
      { text },
      {
        body: {
          mode: 'ui',
          currentSpec: state.current,
          repairPrompt: state.repairPrompt,
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
    setValidationNotice(null);
    setPendingSelect(null);
    setEditBase(null);
    setView('preview');
    setMobileTab('chat');
    router.replace('/');
  };

  const handleSelectProject = async (id: number): Promise<void> => {
    // 生成中なら中断してから切り替える（生成中表示が切替先に漏れるのを防ぐ）。
    void stop();
    // クリック直後に読込中を見せ、タイトルは既知のリスト項目から先行表示する。
    const known = persistence.projects.find((project) => project.id === id);
    setPendingSelect({ title: known?.title ?? '読み込み中…' });
    setView('preview');
    setMobileTab('preview');
    try {
      const project = await loadProjectAction(id);
      if (project === null) {
        return;
      }
      persistence.markLoaded(project);
      dispatch({
        type: 'load-project',
        content: project.spec,
        meta: project.meta,
      });
      setEditBase(null);
      // 履歴を切り替えてもトークが消えないよう会話を復元する。各版を
      // [user(指示) → assistant(説明文)] に展開する。説明文はプレーンテキストなので
      // ChatPanel の describe がそのまま表示する。
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
                text:
                  turn.meta.description === ''
                    ? '内容を更新しました'
                    : turn.meta.description,
              },
            ],
          });
          return turnMessages;
        },
      );
      setMessages(restored);
      setValidationNotice(null);
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

  useProjectUrlSync('/', persistence.projectId, (projectId) => {
    void handleSelectProject(projectId);
  });

  return (
    <StudioShell
      currentProjectId={persistence.projectId}
      header={
        <>
          <ProjectTitle
            newProjectLabel="新しいプロジェクト"
            pendingTitle={pendingSelect?.title ?? null}
            projectId={persistence.projectId}
            projectTitle={persistence.projectTitle}
          />
          <div className="hidden gap-2 lg:flex">
            <ViewTabs onChange={setView} options={viewOptions} value={view} />
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
              <CopyCodeButton code={displayedCode} />
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
        </>
      }
      onNewProject={handleNewProject}
      onSelectProject={(id) => {
        void handleSelectProject(id);
      }}
      projects={persistence.projects}
      tool="ui"
    >
      <div className="flex gap-2 px-4 py-2 lg:hidden">
        <ViewTabs
          onChange={(tab) => {
            setMobileTab(tab);
            if (tab !== 'chat') {
              setView(tab);
            }
          }}
          options={mobileTabOptions}
          value={mobileTab}
        />
      </div>

      <StudioPanes
        chat={
          <ChatPanel
            emptyStateHint={emptyStateHint}
            emptyStateTitle={emptyStateTitle}
            errorText={chatErrorText}
            generatingStatus={generatingStatus}
            input={input}
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
          <div className="min-h-0 flex-1 overflow-hidden" ref={frameRef}>
            <div
              className={
                view === 'preview' ? 'bg-bg-surface relative h-full' : 'hidden'
              }
            >
              {displaySpec === null ? (
                isBusy ? (
                  <PreviewLoading message="UI を生成しています…" />
                ) : (
                  <div className="text-fg-mute flex h-full items-center justify-center p-6 text-center text-sm leading-relaxed">
                    生成すると、ここにライブプレビューが表示されます
                  </div>
                )
              ) : (
                <SpecPreview loading={isBusy} spec={displaySpec} />
              )}
              {/* 履歴/フォーク選択の読込中オーバーレイ。 */}
              {pendingSelect === null ? null : (
                <PreviewLoading message="プロジェクトを読み込んでいます…" />
              )}
            </div>
            <div className={view === 'preview' ? 'hidden' : 'h-full'}>
              <CodePanel
                code={displayedCode}
                isStreaming={isBusy}
                lang={view === 'tsx' ? 'tsx' : 'json'}
              />
            </div>
          </div>
        }
      />
    </StudioShell>
  );
};
