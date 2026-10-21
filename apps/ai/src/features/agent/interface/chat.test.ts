import { streamText } from 'ai';
import type * as ai from 'ai';
import { convertArrayToReadableStream, MockLanguageModelV4 } from 'ai/test';
import { after } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { insertArtifactWithFirstVersion } from '@/features/artifacts/infrastructure/artifact-repository';
import {
  insertUsageWithinLimits,
  selectCostSinceMicroUsd,
  updateUsageCost,
} from '@/features/usage/infrastructure/usage-repository';
import { requireAllowedSession } from '@/shared/auth/require-allowed-session';
import { getGenerationModel } from '@/shared/claude/claude-provider';

import type { AgentUIMessage } from '../application/agent-message';
import { watchStopRequest } from '../application/stop-watch';
import type * as toolsModule from '../application/tools';
import { WITHHELD_OUTPUT_TEXT } from '../application/withhold-tool-outputs';
import { fetchGithubContent } from '../infrastructure/github-api';
import type * as githubApiModule from '../infrastructure/github-api';
import {
  fetchOwnerBlogMarkdown,
  fetchOwnerBlogs,
} from '../infrastructure/owner-api';
import {
  claimThreadRun,
  insertThreadMessage,
  insertThreadWithRun,
  releaseThreadRun,
  selectThread,
  selectThreadMessages,
  updateLastInputTokens,
} from '../infrastructure/thread-repository';
import type { ThreadRow } from '../infrastructure/thread-repository';
import { handleChat } from './chat';

vi.mock('ai', async (importOriginal) => {
  const actual = await importOriginal<typeof ai>();
  return { ...actual, streamText: vi.fn(actual.streamText) };
});
vi.mock('server-only', () => ({}));
vi.mock('next/server', () => ({ after: vi.fn() }));
vi.mock('@/shared/auth/require-allowed-session', () => ({
  requireAllowedSession: vi.fn(),
}));
vi.mock('@/shared/claude/claude-provider', () => ({
  getGenerationModel: vi.fn(),
}));
vi.mock('@/features/usage/infrastructure/usage-repository', () => ({
  insertUsageWithinLimits: vi.fn(),
  selectCostSinceMicroUsd: vi.fn(),
  updateUsageCost: vi.fn(),
}));
vi.mock('@/features/artifacts/infrastructure/artifact-repository', () => ({
  insertArtifactWithFirstVersion: vi.fn(),
  insertNextVersion: vi.fn(),
  selectVersion: vi.fn(),
}));
vi.mock('../infrastructure/thread-repository', () => ({
  claimThreadRun: vi.fn(),
  insertThreadMessage: vi.fn(),
  insertThreadWithRun: vi.fn(),
  releaseThreadRun: vi.fn(),
  selectThread: vi.fn(),
  selectThreadMessages: vi.fn(),
  updateLastInputTokens: vi.fn(),
}));
vi.mock('../infrastructure/owner-api', () => ({
  fetchOwnerBlogs: vi.fn(),
  fetchOwnerBlogMarkdown: vi.fn(),
  fetchOwnerOverview: vi.fn(),
  fetchOwnerInquiries: vi.fn(),
}));
vi.mock('../infrastructure/github-api', async (importOriginal) => ({
  ...(await importOriginal<typeof githubApiModule>()),
  fetchGithubContent: vi.fn(),
  fetchGithubIssue: vi.fn(),
  fetchGithubIssueComments: vi.fn(),
  fetchGithubPull: vi.fn(),
  fetchGithubPullFiles: vi.fn(),
  fetchGithubRepos: vi.fn(),
  searchGithubCode: vi.fn(),
  searchGithubIssues: vi.fn(),
}));
vi.mock('../application/stop-watch', () => ({ watchStopRequest: vi.fn() }));

type LanguageModelV4StreamPart =
  Awaited<
    ReturnType<MockLanguageModelV4['doStream']>
  >['stream'] extends ReadableStream<infer PART>
    ? PART
    : never;

const THREAD_ID = '0b9c6f3e-5a4e-4f7a-9d0e-2f6b1c3a8e71';
const NOW = '2026-10-14T12:00:00.000Z';

const blog = {
  slug: 'arianotify',
  title: 'ariaNotify()でスクリーンリーダーに任意の文字列を読み上げさせる',
  description: 'ariaNotify() の紹介',
  tags: ['a11y'],
  publishedAt: '2026-09-28T00:00:00.000Z',
  url: 'https://k8o.me/blog/arianotify',
};

const userMessage = (
  text = 'arianotify の記事を要約して',
  id = 'u1',
): AgentUIMessage => ({ id, role: 'user', parts: [{ type: 'text', text }] });

const chatBody = (overrides: Record<string, unknown> = {}): unknown => ({
  threadId: THREAD_ID,
  trigger: 'submit-message',
  message: userMessage(),
  ...overrides,
});

const chatRequest = (body: unknown, signal?: AbortSignal): Request =>
  new Request('https://ai.k8o.me/api/chat', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    ...(signal === undefined ? {} : { signal }),
  });

const existingThread = (overrides: Partial<ThreadRow> = {}): ThreadRow => ({
  id: THREAD_ID,
  userId: 'u1',
  title: '記事の要約',
  model: 'claude-sonnet-5-5',
  runId: null,
  runHeartbeatAt: null,
  lastInputTokens: 1000,
  updatedAt: '2026-10-13T00:00:00.000Z',
  ...overrides,
});

// 1ステップあたり、入力 1000（うちキャッシュの読み出し 800・書き込み 100）、出力 200。
// Sonnet 5.5 の単価で 100×2 + 100×2.5 + 800×0.2 + 200×10 = 2610 マイクロドル
const stepUsage = {
  inputTokens: { total: 1000, noCache: 100, cacheRead: 800, cacheWrite: 100 },
  outputTokens: { total: 200, text: 200, reasoning: 0 },
};

const finishChunk = (
  unified: 'stop' | 'tool-calls' | 'content-filter' | 'length',
  extra: Partial<Extract<LanguageModelV4StreamPart, { type: 'finish' }>> = {},
): LanguageModelV4StreamPart => ({
  type: 'finish',
  finishReason: { unified, raw: unified },
  usage: stepUsage,
  ...extra,
});

const textStep = (
  text: string,
  finishReason: 'stop' | 'content-filter' | 'length' = 'stop',
): LanguageModelV4StreamPart[] => [
  { type: 'stream-start', warnings: [] },
  { type: 'text-start', id: 't' },
  { type: 'text-delta', id: 't', delta: text },
  { type: 'text-end', id: 't' },
  finishChunk(finishReason),
];

const toolStep = (
  toolName: keyof (typeof toolsModule)['agentTools'],
  input: unknown,
  toolCallId = 'call-1',
): LanguageModelV4StreamPart[] => [
  { type: 'stream-start', warnings: [] },
  {
    type: 'tool-call',
    toolCallId,
    toolName,
    input: JSON.stringify(input),
  },
  finishChunk('tool-calls'),
];

// @ai-sdk/anthropic と同じく、署名は空の reasoning-delta の providerMetadata で流す
const reasoningChunks = (
  id: string,
  signature: string,
): LanguageModelV4StreamPart[] => [
  { type: 'reasoning-start', id },
  { type: 'reasoning-delta', id, delta: `${signature} の思考` },
  {
    type: 'reasoning-delta',
    id,
    delta: '',
    providerMetadata: { anthropic: { signature } },
  },
  { type: 'reasoning-end', id },
];

const SOURCE_LINE = "const marker = '原文の行';";

const FILE_INPUT = { repo: 'k8o', path: 'apps/ai/src/proxy.ts' };

const FILE_OUTPUT = [
  'k35o/k8o の apps/ai/src/proxy.ts（ref: 既定の枝・全 1 行・1〜1 行目）',
  `1\t${SOURCE_LINE}`,
].join('\n');

// 考えてから read_github_file でファイルを読み、読んだあとにまた考えてから答える Claude の2ステップ
const readFileSteps = (): LanguageModelV4StreamPart[][] => [
  [
    { type: 'stream-start', warnings: [] },
    ...reasoningChunks('r1', 'sig-1'),
    {
      type: 'tool-call',
      toolCallId: 'call-read',
      toolName: 'read_github_file',
      input: JSON.stringify(FILE_INPUT),
    },
    finishChunk('tool-calls'),
  ],
  [
    { type: 'stream-start', warnings: [] },
    ...reasoningChunks('r2', 'sig-2'),
    { type: 'text-start', id: 't' },
    { type: 'text-delta', id: 't', delta: '要約です' },
    { type: 'text-end', id: 't' },
    finishChunk('stop'),
  ],
];

const UI_SPEC = {
  root: 'ok',
  elements: { ok: { type: 'Button', props: { label: 'OK' } } },
};

// generate_ui の中で UI を組む Claude の1回の呼び出し
const uiSpecStep = (): LanguageModelV4StreamPart[] =>
  textStep(
    [
      'タイトル: 確認',
      'OK のボタンを置きました。',
      '```spec',
      '{"op":"add","path":"/root","value":"ok"}',
      '{"op":"add","path":"/elements/ok","value":{"type":"Button","props":{"label":"OK"}}}',
      '```',
    ].join('\n'),
  );

const uiInput = { title: '確認ボタン', instruction: 'OK のボタンを置く' };

const SLIDES_DECK = [
  '<Cover>',
  '# 発表',
  '</Cover>',
  '',
  '---',
  '',
  '## まとめ',
].join('\n');

// generate_slides の中でデッキを書く Claude の1回の呼び出し
const slidesDeckStep = (): LanguageModelV4StreamPart[] =>
  textStep(
    [
      '````md',
      SLIDES_DECK,
      '````',
      '',
      '```json',
      '{"title": "発表", "description": "2枚のスライドにしました。", "changes": []}',
      '```',
    ].join('\n'),
  );

const slidesInput = { title: 'LT の資料', instruction: '2枚のスライドにする' };

// 渡したステップを、呼ばれた順に1つずつ流す Claude の代役
const mockClaude = (
  ...steps: Array<
    | LanguageModelV4StreamPart[]
    | (() => Promise<ReadableStream<LanguageModelV4StreamPart>>)
  >
): MockLanguageModelV4 => {
  let call = 0;
  const model = new MockLanguageModelV4({
    doStream: async () => {
      const step = steps[call];
      call += 1;
      if (step === undefined) {
        throw new Error('想定より多くのステップが呼ばれました');
      }
      return {
        stream:
          typeof step === 'function'
            ? await step()
            : convertArrayToReadableStream(step),
      };
    },
  });
  vi.mocked(getGenerationModel).mockReturnValue(model);
  return model;
};

// 書き始めたところで止まって中断を待ち、中断されると実際の fetch と同じく、読み途中の
// ストリームを中断の理由でエラーにする Claude の代役
const mockHangingClaude = (): MockLanguageModelV4 => {
  const model = new MockLanguageModelV4({
    doStream: ({ abortSignal }) =>
      Promise.resolve({
        stream: new ReadableStream<LanguageModelV4StreamPart>({
          start(controller) {
            controller.enqueue({ type: 'stream-start', warnings: [] });
            controller.enqueue({ type: 'text-start', id: 't' });
            controller.enqueue({
              type: 'text-delta',
              id: 't',
              delta: '途中まで',
            });
            abortSignal?.addEventListener('abort', () => {
              controller.error(abortSignal.reason);
            });
          },
        }),
      }),
  });
  vi.mocked(getGenerationModel).mockReturnValue(model);
  return model;
};

type BodyReader = ReadableStreamDefaultReader<Uint8Array>;

// 利用者の画面に text が届くまで、応答の body を読み進める
const readUntil = async (
  response: Response,
  text: string,
): Promise<BodyReader> => {
  const reader = response.body?.getReader();
  if (reader === undefined) {
    throw new Error('応答に body がありません');
  }
  const decoder = new TextDecoder();
  let received = '';
  while (!received.includes(text)) {
    const { done, value } = await reader.read();
    if (done) {
      throw new Error(`${text} が届く前に応答が終わりました`);
    }
    received += decoder.decode(value, { stream: true });
  }
  return reader;
};

const readToEnd = async (reader: BodyReader): Promise<void> => {
  let result = await reader.read();
  while (!result.done) {
    result = await reader.read();
  }
};

let afterTasks: Array<Promise<unknown>> = [];

// 応答を返したあとの処理（after に載せたもの）まで終わらせる
const settle = async (): Promise<void> => {
  await Promise.all(afterTasks);
};

const savedMessages = (): unknown[] =>
  vi.mocked(insertThreadMessage).mock.calls.map(([input]) => input.message);

const savedAssistant = (): AgentUIMessage => {
  const message = savedMessages().at(-1) as AgentUIMessage | undefined;
  if (message?.role !== 'assistant') {
    throw new Error('assistant のメッセージが保存されていません');
  }
  return message;
};

const contentParts = (message: AgentUIMessage): AgentUIMessage['parts'] =>
  message.parts.filter((part) => part.type !== 'step-start');

// 保存したメッセージを履歴にして、既存のスレッドで次のターンを送る
const sendNextTurn = async (
  text: string,
  id: string,
): Promise<MockLanguageModelV4> => {
  vi.mocked(selectThread).mockResolvedValue(existingThread());
  vi.mocked(selectThreadMessages).mockResolvedValue(savedMessages());
  const model = mockClaude(textStep(`${text}への答え`));
  const response = await handleChat(
    chatRequest(chatBody({ message: userMessage(text, id) })),
  );
  await response.text();
  await settle();
  return model;
};

const startedRunId = (): string => {
  const [input] =
    vi.mocked(insertThreadWithRun).mock.calls[0] ??
    vi.mocked(claimThreadRun).mock.calls[0] ??
    [];
  if (input === undefined) {
    throw new Error('実行が始まっていません');
  }
  return input.runId;
};

const watchedRun = (): Parameters<typeof watchStopRequest>[0] => {
  const [input] = vi.mocked(watchStopRequest).mock.calls[0] ?? [];
  if (input === undefined) {
    throw new Error('停止の監視が始まっていません');
  }
  return input;
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'], now: Date.parse(NOW) });
  afterTasks = [];
  vi.mocked(after).mockImplementation((task) => {
    if (task instanceof Promise) {
      afterTasks.push(task);
    }
  });
  vi.mocked(requireAllowedSession).mockResolvedValue({ userId: 'u1' });
  vi.mocked(insertUsageWithinLimits).mockResolvedValue(7);
  vi.mocked(selectCostSinceMicroUsd).mockResolvedValue(0);
  vi.mocked(updateUsageCost).mockResolvedValue();
  vi.mocked(selectThread).mockResolvedValue(null);
  vi.mocked(insertThreadWithRun).mockResolvedValue(true);
  vi.mocked(claimThreadRun).mockResolvedValue(true);
  vi.mocked(selectThreadMessages).mockResolvedValue([]);
  vi.mocked(insertThreadMessage).mockResolvedValue();
  vi.mocked(releaseThreadRun).mockResolvedValue();
  vi.mocked(updateLastInputTokens).mockResolvedValue();
  vi.mocked(fetchOwnerBlogs).mockResolvedValue([blog]);
  vi.mocked(fetchOwnerBlogMarkdown).mockResolvedValue('# ariaNotify()');
  vi.mocked(insertArtifactWithFirstVersion).mockResolvedValue();
  vi.mocked(fetchGithubContent).mockResolvedValue({
    type: 'file',
    size: SOURCE_LINE.length,
    text: SOURCE_LINE,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('handleChat', () => {
  describe('正常系', () => {
    it('tool で記事を探してから答えると、tool の結果と本文を持つ返答を completed として保存し、実行中の印を外す', async () => {
      mockClaude(
        toolStep('list_blogs', {}),
        textStep('ariaNotify() の記事です'),
      );

      const response = await handleChat(chatRequest(chatBody()));
      await response.text();
      await settle();

      expect(response.status).toBe(200);
      expect(savedMessages()).toHaveLength(2);
      expect(savedMessages()[0]).toStrictEqual(userMessage());
      const assistant = savedAssistant();
      expect(contentParts(assistant)).toMatchObject([
        {
          type: 'tool-list_blogs',
          toolCallId: 'call-1',
          state: 'output-available',
          input: {},
          output: { items: [blog] },
        },
        { type: 'text', text: 'ariaNotify() の記事です' },
      ]);
      expect(assistant.metadata).toStrictEqual({ end: 'completed' });
      expect(releaseThreadRun).toHaveBeenCalledExactlyOnceWith({
        threadId: THREAD_ID,
        runId: startedRunId(),
      });
    });

    it('ステップごとに、累積のトークン数とその費用で利用の行を更新し、スレッドの直近の入力トークン数を書く', async () => {
      mockClaude(toolStep('list_blogs', {}), textStep('答え'));

      const response = await handleChat(chatRequest(chatBody()));
      await response.text();
      await settle();

      expect(vi.mocked(updateUsageCost).mock.calls).toStrictEqual([
        [
          {
            id: 7,
            inputTokens: 1000,
            outputTokens: 200,
            cacheReadTokens: 800,
            cacheWriteTokens: 100,
            costMicroUsd: 2610,
          },
        ],
        [
          {
            id: 7,
            inputTokens: 2000,
            outputTokens: 400,
            cacheReadTokens: 1600,
            cacheWriteTokens: 200,
            costMicroUsd: 5220,
          },
        ],
      ]);
      expect(vi.mocked(updateLastInputTokens).mock.calls).toStrictEqual([
        [{ threadId: THREAD_ID, inputTokens: 1000 }],
        [{ threadId: THREAD_ID, inputTokens: 1000 }],
      ]);
    });

    it('新しいスレッドは、頼んだモデルと本文から作ったタイトルで、実行中として作る', async () => {
      mockClaude(textStep('答え'));

      const response = await handleChat(
        chatRequest(chatBody({ model: 'claude-opus-5-5' })),
      );
      await response.text();

      expect(insertUsageWithinLimits).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          app: 'agent',
          kind: 'generation',
          userId: 'u1',
          model: 'claude-opus-5-5',
        }),
      );
      expect(insertThreadWithRun).toHaveBeenCalledExactlyOnceWith({
        id: THREAD_ID,
        userId: 'u1',
        title: 'arianotify の記事を要約して',
        model: 'claude-opus-5-5',
        runId: expect.any(String),
        heartbeatAt: NOW,
      });
      expect(getGenerationModel).toHaveBeenCalledExactlyOnceWith(
        'claude-opus-5-5',
      );
    });

    it('既存のスレッドでは、送られた model を使わずにスレッドのモデルで続け、履歴のあとに新しい本文を送る', async () => {
      vi.mocked(selectThread).mockResolvedValue(existingThread());
      vi.mocked(selectThreadMessages).mockResolvedValue([
        userMessage('最初の質問', 'u0'),
        {
          id: 'a0',
          role: 'assistant',
          parts: [{ type: 'text', text: '最初の答え' }],
          metadata: { end: 'completed' },
        },
      ]);
      const model = mockClaude(textStep('答え'));

      const response = await handleChat(
        chatRequest(chatBody({ model: 'claude-opus-5-5' })),
      );
      await response.text();

      expect(getGenerationModel).toHaveBeenCalledExactlyOnceWith(
        'claude-sonnet-5-5',
      );
      expect(insertThreadWithRun).not.toHaveBeenCalled();
      expect(claimThreadRun).toHaveBeenCalledExactlyOnceWith({
        threadId: THREAD_ID,
        userId: 'u1',
        runId: expect.any(String),
        heartbeatAt: NOW,
        staleBeforeIso: '2026-10-14T11:59:30.000Z',
      });
      expect(
        model.doStreamCalls[0]?.prompt.filter(
          (message) => message.role !== 'system',
        ),
      ).toMatchObject([
        { role: 'user', content: [{ type: 'text', text: '最初の質問' }] },
        { role: 'assistant', content: [{ type: 'text', text: '最初の答え' }] },
        {
          role: 'user',
          content: [{ type: 'text', text: 'arianotify の記事を要約して' }],
        },
      ]);
    });

    it('thinking は、履歴と噛み合わないブロックを 400 にせず落とす設定で頼む', async () => {
      const model = mockClaude(textStep('答え'));

      const response = await handleChat(chatRequest(chatBody()));
      await response.text();

      expect(
        model.doStreamCalls[0]?.providerOptions?.['anthropic'],
      ).toMatchObject({
        thinking: {
          type: 'adaptive',
          blockBinding: { prefixMismatchBehavior: 'drop_block' },
        },
      });
    });

    it('generate_ui を呼ぶと、UI の生成を別に予約して tool の中で回し、保存した版を確定の出力として残す', async () => {
      mockClaude(
        toolStep('generate_ui', uiInput),
        uiSpecStep(),
        textStep('確認のボタンを作りました'),
      );

      const response = await handleChat(chatRequest(chatBody()));
      await response.text();
      await settle();

      expect(contentParts(savedAssistant())).toMatchObject([
        {
          type: 'tool-generate_ui',
          state: 'output-available',
          input: uiInput,
          output: {
            status: 'done',
            artifactId: expect.stringMatching(/^[0-9a-f]{12}$/u),
            version: 1,
            summary: 'OK のボタンを置きました。',
            spec: UI_SPEC,
          },
        },
        { type: 'text', text: '確認のボタンを作りました' },
      ]);
      expect(vi.mocked(insertUsageWithinLimits).mock.calls).toMatchObject([
        [{ app: 'agent', kind: 'generation', userId: 'u1' }],
        [
          {
            app: 'agent',
            kind: 'ui',
            userId: 'u1',
            model: 'claude-sonnet-5-5',
          },
        ],
      ]);
      expect(insertArtifactWithFirstVersion).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          userId: 'u1',
          threadId: THREAD_ID,
          title: '確認ボタン',
          content: { spec: UI_SPEC },
        }),
      );
    });

    it('generate_slides を呼ぶと、スライドの生成を別に予約して tool の中で回し、保存した版を確定の出力として残す', async () => {
      mockClaude(
        toolStep('generate_slides', slidesInput),
        slidesDeckStep(),
        textStep('スライドを作りました'),
      );

      const response = await handleChat(chatRequest(chatBody()));
      await response.text();
      await settle();

      expect(contentParts(savedAssistant())).toMatchObject([
        {
          type: 'tool-generate_slides',
          state: 'output-available',
          input: slidesInput,
          output: {
            status: 'done',
            artifactId: expect.stringMatching(/^[0-9a-f]{12}$/u),
            version: 1,
            summary: '2枚のスライドにしました。',
            source: SLIDES_DECK,
          },
        },
        { type: 'text', text: 'スライドを作りました' },
      ]);
      expect(vi.mocked(insertUsageWithinLimits).mock.calls).toMatchObject([
        [{ app: 'agent', kind: 'generation', userId: 'u1' }],
        [
          {
            app: 'agent',
            kind: 'slides',
            userId: 'u1',
            model: 'claude-sonnet-5-5',
          },
        ],
      ]);
      expect(insertArtifactWithFirstVersion).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          userId: 'u1',
          kind: 'slides',
          threadId: THREAD_ID,
          title: 'LT の資料',
          content: { source: SLIDES_DECK },
        }),
      );
    });

    it('GitHub を読んだ返答は、画面へは原文を流し、保存では出力を決まった文に置き換えて、そのあとの thinking を外す', async () => {
      mockClaude(...readFileSteps());

      const response = await handleChat(chatRequest(chatBody()));
      const body = await response.text();
      await settle();

      expect(body).toContain(SOURCE_LINE);
      const assistant = savedAssistant();
      expect(contentParts(assistant)).toMatchObject([
        {
          type: 'reasoning',
          providerMetadata: { anthropic: { signature: 'sig-1' } },
        },
        {
          type: 'tool-read_github_file',
          toolCallId: 'call-read',
          state: 'output-available',
          input: FILE_INPUT,
          output: WITHHELD_OUTPUT_TEXT,
        },
        { type: 'text', text: '要約です' },
      ]);
      expect(JSON.stringify(assistant)).not.toContain(SOURCE_LINE);
    });

    it('generate_ui と generate_slides には、会話の文脈と、ほかの tool より長い時間の上限を渡す', async () => {
      mockClaude(textStep('答え'));

      const response = await handleChat(chatRequest(chatBody()));
      await response.text();

      const artifactContext = {
        userId: 'u1',
        threadId: THREAD_ID,
        model: 'claude-sonnet-5-5',
      };
      expect(streamText).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          toolsContext: {
            generate_ui: artifactContext,
            generate_slides: artifactContext,
          },
          timeout: {
            totalMs: 750_000,
            toolMs: 30_000,
            tools: { generate_uiMs: 360_000, generate_slidesMs: 360_000 },
          },
        }),
      );
    });
  });

  describe('切断', () => {
    it('応答の body を少し読んで切断しても、最後まで生成して完成した返答を保存する', async () => {
      const secondStep = Promise.withResolvers<undefined>();
      mockClaude(toolStep('list_blogs', {}), async () => {
        await secondStep.promise;
        return convertArrayToReadableStream(textStep('最後までの答え'));
      });

      const response = await handleChat(chatRequest(chatBody()));
      const reader = response.body?.getReader();
      await reader?.read();
      await reader?.cancel();
      secondStep.resolve(undefined);
      await settle();

      const assistant = savedAssistant();
      expect(contentParts(assistant)).toMatchObject([
        { type: 'tool-list_blogs', state: 'output-available' },
        { type: 'text', text: '最後までの答え' },
      ]);
      expect(assistant.metadata).toStrictEqual({ end: 'completed' });
      expect(releaseThreadRun).toHaveBeenCalledOnce();
    });

    it('要求の signal が中断されても、モデルへの中断のシグナルは立たない', async () => {
      const secondStep = Promise.withResolvers<undefined>();
      const model = mockClaude(toolStep('list_blogs', {}), async () => {
        await secondStep.promise;
        return convertArrayToReadableStream(textStep('最後までの答え'));
      });
      const controller = new AbortController();

      const response = await handleChat(
        chatRequest(chatBody(), controller.signal),
      );
      const reader = response.body?.getReader();
      await reader?.read();
      controller.abort();
      await reader?.cancel();
      secondStep.resolve(undefined);
      await settle();

      expect(model.doStreamCalls).toHaveLength(2);
      expect(model.doStreamCalls[1]?.abortSignal?.aborted).toBe(false);
      expect(savedAssistant().metadata).toStrictEqual({ end: 'completed' });
    });
  });

  describe('停止', () => {
    it('停止の要求を受けると、途中までの返答を stopped として保存し、実行中の印を外す', async () => {
      mockHangingClaude();

      const response = await handleChat(chatRequest(chatBody()));
      const reader = await readUntil(response, '途中まで');
      const watchInput = watchedRun();
      watchInput.onStop();
      await readToEnd(reader);
      await settle();

      expect(watchInput).toMatchObject({
        threadId: THREAD_ID,
        runId: startedRunId(),
      });
      const assistant = savedAssistant();
      expect(contentParts(assistant)).toMatchObject([
        { type: 'text', text: '途中まで' },
      ]);
      expect(assistant.metadata).toStrictEqual({ end: 'stopped' });
      expect(releaseThreadRun).toHaveBeenCalledOnce();
    });

    it('実行が終わると、停止の監視を止める', async () => {
      mockClaude(textStep('答え'));

      const response = await handleChat(chatRequest(chatBody()));
      const watchInput = watchedRun();
      expect(watchInput.signal.aborted).toBe(false);
      await response.text();
      await settle();

      expect(watchInput.signal.aborted).toBe(true);
    });
  });

  describe('異常系', () => {
    it('未許可の利用者は 401 で弾き、予約しない', async () => {
      vi.mocked(requireAllowedSession).mockResolvedValue(null);

      const response = await handleChat(chatRequest(chatBody()));

      expect(response.status).toBe(401);
      expect(insertUsageWithinLimits).not.toHaveBeenCalled();
    });

    it.each([
      ['JSON でない本文', 'not json'],
      ['regenerate', chatBody({ trigger: 'regenerate-message' })],
      ['UUID でない threadId', chatBody({ threadId: 'thread-1' })],
    ])('%s は 400 で弾き、予約しない', async (_label, body) => {
      const response = await handleChat(chatRequest(body));

      expect(response.status).toBe(400);
      expect(insertUsageWithinLimits).not.toHaveBeenCalled();
    });

    it('ほかの利用者のスレッドには 404 を返し、予約しない', async () => {
      vi.mocked(selectThread).mockResolvedValue(
        existingThread({ userId: 'u2' }),
      );

      const response = await handleChat(chatRequest(chatBody()));

      expect(response.status).toBe(404);
      expect(insertUsageWithinLimits).not.toHaveBeenCalled();
    });

    it('スレッドのモデルが知らないものなら 400 を返し、予約しない', async () => {
      vi.mocked(selectThread).mockResolvedValue(
        existingThread({ model: 'claude-haiku-4-5' }),
      );

      const response = await handleChat(chatRequest(chatBody()));

      expect(response.status).toBe(400);
      expect(insertUsageWithinLimits).not.toHaveBeenCalled();
    });

    it('1時間あたりの上限で予約できなければ、上限の文言で 429 を返し、スレッドを作らない', async () => {
      vi.mocked(insertUsageWithinLimits).mockResolvedValue(null);
      vi.mocked(selectCostSinceMicroUsd).mockResolvedValue(0);

      const response = await handleChat(chatRequest(chatBody()));

      expect(response.status).toBe(429);
      await expect(response.text()).resolves.toBe(
        '1時間あたりの上限に達しました。しばらく待ってから送ってください。',
      );
      expect(insertThreadWithRun).not.toHaveBeenCalled();
    });

    it('月の予算に達して予約できなければ、予算の文言で 429 を返し、スレッドを作らない', async () => {
      vi.mocked(insertUsageWithinLimits).mockResolvedValue(null);
      vi.mocked(selectCostSinceMicroUsd).mockResolvedValue(100_000_000);

      const response = await handleChat(chatRequest(chatBody()));

      expect(response.status).toBe(429);
      await expect(response.text()).resolves.toBe(
        '今月の利用額が上限（$100）に達しました。翌月1日（UTC）まで使えません。',
      );
      expect(insertThreadWithRun).not.toHaveBeenCalled();
    });

    it('ほかの要求が生成中なら 409 を返し、本文を保存せず Claude も呼ばない', async () => {
      vi.mocked(selectThread).mockResolvedValue(existingThread());
      vi.mocked(claimThreadRun).mockResolvedValue(false);
      const model = mockClaude(textStep('答え'));

      const response = await handleChat(chatRequest(chatBody()));

      expect(response.status).toBe(409);
      await expect(response.text()).resolves.toBe('この会話は応答を生成中です');
      expect(insertThreadMessage).not.toHaveBeenCalled();
      expect(model.doStreamCalls).toHaveLength(0);
    });

    it('直近の入力が 80 万トークンを超えたスレッドは、予約せずに 409 で新しいチャットを促す', async () => {
      vi.mocked(selectThread).mockResolvedValue(
        existingThread({ lastInputTokens: 800_001 }),
      );

      const response = await handleChat(chatRequest(chatBody()));

      expect(response.status).toBe(409);
      await expect(response.text()).resolves.toBe(
        'この会話は長くなりすぎました。新しいチャットで続けてください',
      );
      expect(insertUsageWithinLimits).not.toHaveBeenCalled();
    });

    it('Claude がエラーを流して終えると、途中までの返答を failed として保存し、実行中の印を外す', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      mockClaude([
        { type: 'stream-start', warnings: [] },
        { type: 'text-start', id: 't' },
        { type: 'text-delta', id: 't', delta: '途中まで' },
        { type: 'error', error: new Error('overloaded') },
      ]);

      const response = await handleChat(chatRequest(chatBody()));
      await response.text();
      await settle();

      expect(savedAssistant().metadata).toStrictEqual({ end: 'failed' });
      expect(releaseThreadRun).toHaveBeenCalledOnce();
      // エラーで終わったステップの入力トークン数で、直近の値を上書きしない
      expect(updateLastInputTokens).not.toHaveBeenCalled();
    });

    it('Claude のストリームが例外で切れても、failed として保存し、実行中の印を外す', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      mockClaude(
        async () =>
          new ReadableStream<LanguageModelV4StreamPart>({
            start(controller) {
              controller.enqueue({ type: 'stream-start', warnings: [] });
              controller.enqueue({ type: 'text-start', id: 't' });
              controller.enqueue({
                type: 'text-delta',
                id: 't',
                delta: '途中',
              });
              controller.error(new Error('socket hang up'));
            },
          }),
      );

      const response = await handleChat(chatRequest(chatBody()));
      await response.text().catch(() => undefined);
      await settle();

      expect(savedAssistant().metadata).toStrictEqual({ end: 'failed' });
      expect(releaseThreadRun).toHaveBeenCalledOnce();
    });

    it.each([
      ['content-filter', 'refused'],
      ['length', 'length'],
    ] as const)(
      'Claude が %s で終えると、返答を %s として保存する',
      async (finishReason, end) => {
        mockClaude(textStep('途中まで', finishReason));

        const response = await handleChat(chatRequest(chatBody()));
        await response.text();
        await settle();

        expect(savedAssistant().metadata).toStrictEqual({ end });
      },
    );

    it('履歴の読み込みに失敗したら、実行中の印を外してから例外を投げ、停止の監視を始めない', async () => {
      vi.mocked(selectThreadMessages).mockRejectedValue(new Error('db down'));

      await expect(handleChat(chatRequest(chatBody()))).rejects.toThrow(
        'db down',
      );
      expect(releaseThreadRun).toHaveBeenCalledExactlyOnceWith({
        threadId: THREAD_ID,
        runId: startedRunId(),
      });
      expect(watchStopRequest).not.toHaveBeenCalled();
    });

    it('返答の保存に失敗しても、実行中の印は外す', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(insertThreadMessage)
        .mockResolvedValueOnce()
        .mockRejectedValueOnce(new Error('db down'));
      mockClaude(textStep('答え'));

      const response = await handleChat(chatRequest(chatBody()));
      await response.text();
      await settle();

      expect(error).toHaveBeenCalledWith(
        '返答の保存に失敗しました',
        expect.any(Error),
      );
      expect(releaseThreadRun).toHaveBeenCalledOnce();
    });
  });

  describe('エッジケース', () => {
    it('毎回 tool を呼ぶモデルは、20 ステップで止めて step-limit として保存する', async () => {
      const model = mockClaude(
        ...Array.from({ length: 21 }, (_, step) =>
          toolStep('list_blogs', {}, `call-${step}`),
        ),
      );

      const response = await handleChat(chatRequest(chatBody()));
      await response.text();
      await settle();

      expect(model.doStreamCalls).toHaveLength(20);
      expect(savedAssistant().metadata).toStrictEqual({ end: 'step-limit' });
    });

    it('tool を呼んだステップのあとで月の予算を超えていたら、そこで止めて budget として保存する', async () => {
      vi.mocked(selectCostSinceMicroUsd).mockResolvedValue(100_000_000);
      const model = mockClaude(
        toolStep('list_blogs', {}),
        textStep('ここには来ない'),
      );

      const response = await handleChat(chatRequest(chatBody()));
      await response.text();
      await settle();

      expect(model.doStreamCalls).toHaveLength(1);
      expect(savedAssistant().metadata).toStrictEqual({ end: 'budget' });
    });

    it('直近の入力がちょうど 80 万トークンのスレッドは続けられる', async () => {
      vi.mocked(selectThread).mockResolvedValue(
        existingThread({ lastInputTokens: 800_000 }),
      );
      mockClaude(textStep('答え'));

      const response = await handleChat(chatRequest(chatBody()));
      await response.text();

      expect(response.status).toBe(200);
    });

    it('途中で止まった返答のあとの次のターンでは、結果の無い tool 呼び出しを落として送る', async () => {
      vi.mocked(selectThread).mockResolvedValue(existingThread());
      vi.mocked(selectThreadMessages).mockResolvedValue([
        userMessage('最初の質問', 'u0'),
        {
          id: 'a0',
          role: 'assistant',
          parts: [
            { type: 'step-start' },
            { type: 'text', text: '読みます', state: 'done' },
            {
              type: 'tool-read_blog',
              toolCallId: 'call-0',
              state: 'input-available',
              input: { slug: 'arianotify' },
            },
          ],
          metadata: { end: 'stopped' },
        },
      ]);
      const model = mockClaude(textStep('答え'));

      const response = await handleChat(chatRequest(chatBody()));
      await response.text();

      const assistantTurn = model.doStreamCalls[0]?.prompt.find(
        (message) => message.role === 'assistant',
      );
      expect(assistantTurn?.content).toStrictEqual([
        expect.objectContaining({ type: 'text', text: '読みます' }),
      ]);
    });

    it('文を書かずに generate_ui を呼んで止めた返答のあとの次のターンでは、そのステップの thinking も送らない', async () => {
      vi.mocked(selectThread).mockResolvedValue(existingThread());
      vi.mocked(selectThreadMessages).mockResolvedValue([
        userMessage('UI を作って', 'u0'),
        {
          id: 'a0',
          role: 'assistant',
          parts: [
            { type: 'step-start' },
            {
              type: 'reasoning',
              text: 'UI を作る',
              state: 'done',
              providerMetadata: { anthropic: { signature: 'sig' } },
            },
            {
              type: 'tool-generate_ui',
              toolCallId: 'call-0',
              state: 'output-available',
              input: uiInput,
              output: { status: 'generating', phase: 'drawing', spec: null },
              preliminary: true,
            },
          ],
          metadata: { end: 'stopped' },
        },
      ]);
      const model = mockClaude(textStep('答え'));

      const response = await handleChat(chatRequest(chatBody()));
      await response.text();

      expect(
        model.doStreamCalls[0]?.prompt.filter(
          (message) => message.role !== 'system',
        ),
      ).toMatchObject([
        { role: 'user', content: [{ type: 'text', text: 'UI を作って' }] },
        {
          role: 'user',
          content: [{ type: 'text', text: 'arianotify の記事を要約して' }],
        },
      ]);
    });

    it('generate_ui の返答を次のターンで送り返すとき、tool の結果はループの中で送ったものと同じ文字列にする', async () => {
      const firstTurn = mockClaude(
        toolStep('generate_ui', uiInput, 'call-ui'),
        uiSpecStep(),
        textStep('作りました'),
      );
      const firstResponse = await handleChat(chatRequest(chatBody()));
      await firstResponse.text();
      await settle();

      vi.mocked(selectThread).mockResolvedValue(existingThread());
      vi.mocked(selectThreadMessages).mockResolvedValue(savedMessages());
      const nextTurn = mockClaude(textStep('答え'));
      const nextResponse = await handleChat(
        chatRequest(chatBody({ message: userMessage('ボタンを大きく', 'u2') })),
      );
      await nextResponse.text();

      const toolResultsSentInLoop = firstTurn.doStreamCalls[2]?.prompt.filter(
        (message) => message.role === 'tool',
      );
      expect(toolResultsSentInLoop).toMatchObject([
        {
          content: [
            {
              toolCallId: 'call-ui',
              output: {
                type: 'text',
                value: expect.stringMatching(
                  /^UI「確認ボタン」を artifactId: [0-9a-f]{12} の版 1 として保存し、利用者の画面のプレビューに出しました。\nOK のボタンを置きました。$/u,
                ),
              },
            },
          ],
        },
      ]);
      expect(
        nextTurn.doStreamCalls[0]?.prompt.filter(
          (message) => message.role === 'tool',
        ),
      ).toStrictEqual(toolResultsSentInLoop);
    });

    it('generate_slides の返答を次のターンで送り返すとき、tool の結果はループの中で送ったものと同じ文字列にする', async () => {
      const firstTurn = mockClaude(
        toolStep('generate_slides', slidesInput, 'call-slides'),
        slidesDeckStep(),
        textStep('作りました'),
      );
      const firstResponse = await handleChat(chatRequest(chatBody()));
      await firstResponse.text();
      await settle();

      vi.mocked(selectThread).mockResolvedValue(existingThread());
      vi.mocked(selectThreadMessages).mockResolvedValue(savedMessages());
      const nextTurn = mockClaude(textStep('答え'));
      const nextResponse = await handleChat(
        chatRequest(chatBody({ message: userMessage('まとめを足して', 'u2') })),
      );
      await nextResponse.text();

      const toolResultsSentInLoop = firstTurn.doStreamCalls[2]?.prompt.filter(
        (message) => message.role === 'tool',
      );
      expect(toolResultsSentInLoop).toMatchObject([
        {
          content: [
            {
              toolCallId: 'call-slides',
              output: {
                type: 'text',
                value: expect.stringMatching(
                  /^スライド「LT の資料」を artifactId: [0-9a-f]{12} の版 1 として保存し、利用者の画面のプレビューに出しました。\n2枚のスライドにしました。$/u,
                ),
              },
            },
          ],
        },
      ]);
      expect(
        nextTurn.doStreamCalls[0]?.prompt.filter(
          (message) => message.role === 'tool',
        ),
      ).toStrictEqual(toolResultsSentInLoop);
    });

    it('tool がエラーになった返答を次のターンで送り返すとき、tool の結果はループの中で送ったものと同じ文字列にする', async () => {
      vi.mocked(fetchOwnerBlogMarkdown).mockResolvedValue(null);
      const firstTurn = mockClaude(
        [
          { type: 'stream-start', warnings: [] },
          {
            type: 'tool-call',
            toolCallId: 'call-missing',
            toolName: 'read_blog',
            input: JSON.stringify({ slug: 'missing' }),
          },
          {
            type: 'tool-call',
            toolCallId: 'call-invalid',
            toolName: 'read_blog',
            input: JSON.stringify({ slug: 'Bad_Slug' }),
          },
          finishChunk('tool-calls'),
        ],
        textStep('記事が見つかりませんでした'),
      );
      const firstResponse = await handleChat(chatRequest(chatBody()));
      await firstResponse.text();
      await settle();

      vi.mocked(selectThread).mockResolvedValue(existingThread());
      vi.mocked(selectThreadMessages).mockResolvedValue(savedMessages());
      const nextTurn = mockClaude(textStep('答え'));
      const nextResponse = await handleChat(
        chatRequest(chatBody({ message: userMessage('ほかの記事は？', 'u2') })),
      );
      await nextResponse.text();

      const toolResultsSentInLoop = firstTurn.doStreamCalls[1]?.prompt.filter(
        (message) => message.role === 'tool',
      );
      expect(toolResultsSentInLoop).toMatchObject([
        {
          content: [
            {
              toolCallId: 'call-missing',
              output: {
                type: 'error-text',
                value: 'Error: 記事が見つかりません: missing',
              },
            },
            {
              toolCallId: 'call-invalid',
              output: {
                type: 'error-text',
                value: expect.stringMatching(/^AI_InvalidToolInputError: /u),
              },
            },
          ],
        },
      ]);
      expect(
        nextTurn.doStreamCalls[0]?.prompt.filter(
          (message) => message.role === 'tool',
        ),
      ).toStrictEqual(toolResultsSentInLoop);
    });

    it('GitHub を読んだ返答のあとの次のターンでは、原文の代わりに置き換えた文を text の tool の結果として送り、外した thinking を送らない', async () => {
      const firstTurn = mockClaude(...readFileSteps());
      const firstResponse = await handleChat(chatRequest(chatBody()));
      await firstResponse.text();
      await settle();

      const nextTurn = await sendNextTurn('ほかには？', 'u2');

      expect(
        firstTurn.doStreamCalls[1]?.prompt.filter(
          (message) => message.role === 'tool',
        ),
      ).toMatchObject([
        {
          content: [
            {
              toolCallId: 'call-read',
              output: { type: 'text', value: FILE_OUTPUT },
            },
          ],
        },
      ]);
      expect(
        nextTurn.doStreamCalls[0]?.prompt.filter(
          (message) => message.role !== 'system',
        ),
      ).toMatchObject([
        {
          role: 'user',
          content: [{ type: 'text', text: 'arianotify の記事を要約して' }],
        },
        {
          role: 'assistant',
          content: [
            {
              type: 'reasoning',
              providerOptions: { anthropic: { signature: 'sig-1' } },
            },
            { type: 'tool-call', toolCallId: 'call-read' },
          ],
        },
        {
          role: 'tool',
          content: [
            {
              type: 'tool-result',
              toolCallId: 'call-read',
              output: { type: 'text', value: WITHHELD_OUTPUT_TEXT },
            },
          ],
        },
        { role: 'assistant', content: [{ type: 'text', text: '要約です' }] },
        { role: 'user', content: [{ type: 'text', text: 'ほかには？' }] },
      ]);
    });

    it('GitHub の出力を置き換えたあとは、次のターンとその次のターンで、同じ履歴を1字もずらさずに送る', async () => {
      mockClaude(...readFileSteps());
      const firstResponse = await handleChat(chatRequest(chatBody()));
      await firstResponse.text();
      await settle();

      const secondTurn = await sendNextTurn('ほかには？', 'u2');
      const thirdTurn = await sendNextTurn('ありがとう', 'u3');

      const sentInSecondTurn = secondTurn.doStreamCalls[0]?.prompt;
      const sentInThirdTurn = thirdTurn.doStreamCalls[0]?.prompt;
      expect(
        sentInSecondTurn?.filter((message) => message.role === 'tool'),
      ).toMatchObject([
        {
          content: [{ output: { type: 'text', value: WITHHELD_OUTPUT_TEXT } }],
        },
      ]);
      expect(sentInThirdTurn?.slice(0, sentInSecondTurn?.length)).toStrictEqual(
        sentInSecondTurn,
      );
      expect(sentInThirdTurn?.slice(sentInSecondTurn?.length)).toMatchObject([
        {
          role: 'assistant',
          content: [{ type: 'text', text: 'ほかには？への答え' }],
        },
        { role: 'user', content: [{ type: 'text', text: 'ありがとう' }] },
      ]);
    });

    it('GitHub の tool がエラーになった返答は、エラー文を置き換えずに保存し、次のターンもループの中と同じ文を送る', async () => {
      vi.mocked(fetchGithubContent).mockRejectedValue(
        new Error(
          '見つかりません。名前・パス・番号が違うか、読む権限がありません',
        ),
      );
      const firstTurn = mockClaude(
        toolStep('read_github_file', FILE_INPUT, 'call-missing'),
        textStep('見つかりませんでした'),
      );
      const firstResponse = await handleChat(chatRequest(chatBody()));
      await firstResponse.text();
      await settle();
      expect(contentParts(savedAssistant())).toMatchObject([
        {
          type: 'tool-read_github_file',
          state: 'output-error',
          errorText:
            'Error: 見つかりません。名前・パス・番号が違うか、読む権限がありません',
        },
        { type: 'text', text: '見つかりませんでした' },
      ]);

      const nextTurn = await sendNextTurn('ほかには？', 'u2');

      const toolResultsSentInLoop = firstTurn.doStreamCalls[1]?.prompt.filter(
        (message) => message.role === 'tool',
      );
      expect(toolResultsSentInLoop).toMatchObject([
        {
          content: [
            {
              toolCallId: 'call-missing',
              output: {
                type: 'error-text',
                value:
                  'Error: 見つかりません。名前・パス・番号が違うか、読む権限がありません',
              },
            },
          ],
        },
      ]);
      expect(
        nextTurn.doStreamCalls[0]?.prompt.filter(
          (message) => message.role === 'tool',
        ),
      ).toStrictEqual(toolResultsSentInLoop);
    });

    it('送り返した thinking を Claude API に落とされたら、ログに残す', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      const inputTransformations = [
        {
          type: 'thinking_block_dropped',
          path: 'messages.1.content.0',
          reason: 'prefix_mismatch',
        },
      ];
      mockClaude([
        ...textStep('答え').slice(0, -1),
        finishChunk('stop', {
          providerMetadata: { anthropic: { inputTransformations } },
        }),
      ]);

      const response = await handleChat(chatRequest(chatBody()));
      await response.text();
      await settle();

      expect(error).toHaveBeenCalledWith(
        '送り返した thinking が履歴と噛み合わず、Claude API に落とされました',
        inputTransformations,
      );
    });
  });
});
