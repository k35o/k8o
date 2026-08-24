'use client';

import { useChat } from '@ai-sdk/react';
import type { Spec } from '@json-render/core';
import {
  Button,
  ForkIcon,
  FullscreenIcon,
  IconButton,
} from '@k8o/arte-odyssey';
import { validateGeneratedSpec } from '@k8o/arte-odyssey/json-render';
import { DefaultChatTransport } from 'ai';
import type { UIMessage } from 'ai';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useEffect,
  useEffectEvent,
  useMemo,
  useReducer,
  useRef,
  useState,
  useTransition,
} from 'react';

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
import { loadProjectAction } from '@/features/projects/interface/actions';

import { StudioShell } from '../studio-shell';
import { ChatPanel } from './chat-panel';
import { CodePanel } from './code-panel';
import { CopyCodeButton } from './copy-code-button';
import { PreviewLoading } from './preview-loading';
import { ShareControl } from './share-control';
import { useStudioPersistence } from './use-studio-persistence';

// 設定は完全に静的なので、レンダーごとに生成しない。
const transport = new DefaultChatTransport({ api: '/api/generate' });

type PanelView = 'preview' | 'spec' | 'tsx';

export const Studio = () => {
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
        } catch (error) {
          console.error('版の保存に失敗しました', error);
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

  // 初回マウント時、URL に ?project=<id> があればそのプロジェクトを復元する。
  // Strict Mode の二重実行でも bootedRef で1回だけロードする。
  const bootLoad = useEffectEvent((projectId: number) => {
    void handleSelectProject(projectId);
  });
  const bootedRef = useRef(false);
  useEffect(() => {
    if (bootedRef.current) {
      return;
    }
    bootedRef.current = true;
    const bootId = bootProjectIdRef.current;
    if (bootId !== null && bootId !== undefined) {
      bootLoad(bootId);
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
    <StudioShell
      currentProjectId={persistence.projectId}
      header={
        <>
          <div className="flex min-w-0 items-center gap-2">
            {pendingSelect === null ? (
              persistence.projectId === null ? (
                <span className="text-fg-mute truncate text-sm">
                  新しいプロジェクト
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
                setView('spec');
              }}
              size="sm"
              variant={view === 'spec' ? 'solid' : 'skeleton'}
            >
              spec
            </Button>
            <Button
              color="primary"
              onClick={() => {
                setView('tsx');
              }}
              size="sm"
              variant={view === 'tsx' ? 'solid' : 'skeleton'}
            >
              TSX
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
            setMobileTab('spec');
            setView('spec');
          }}
          size="sm"
          variant={mobileTab === 'spec' ? 'solid' : 'skeleton'}
        >
          spec
        </Button>
        <Button
          color="primary"
          onClick={() => {
            setMobileTab('tsx');
            setView('tsx');
          }}
          size="sm"
          variant={mobileTab === 'tsx' ? 'solid' : 'skeleton'}
        >
          TSX
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
                <div className="absolute inset-0 z-10">
                  <PreviewLoading message="プロジェクトを読み込んでいます…" />
                </div>
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
        </div>
      </div>
    </StudioShell>
  );
};
