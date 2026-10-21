import type { Spec } from '@json-render/core';
import type { ComponentProps } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import type { AgentUIMessage } from '@/features/agent/application/agent-message';
import { WITHHELD_OUTPUT_TEXT } from '@/features/agent/application/withhold-tool-outputs';

import preview from '../../../../../../.storybook/preview';
import { AgentMessage } from './agent-message';

const answer: AgentUIMessage = {
  id: 'a1',
  role: 'assistant',
  metadata: { end: 'completed' },
  parts: [
    { type: 'step-start' },
    {
      type: 'reasoning',
      text: '記事の一覧から a11y の記事を探す。',
      state: 'done',
    },
    { type: 'reasoning', text: '', state: 'done' },
    {
      type: 'tool-list_blogs',
      toolCallId: 'call-1',
      state: 'output-available',
      input: {},
      output: {
        items: [
          {
            slug: 'arianotify',
            title:
              'ariaNotify()でスクリーンリーダーに任意の文字列を読み上げさせる',
            description:
              'ariaNotify()は、DOMを書き換えずに読み上げさせるメソッドです。',
            tags: ['a11y', 'JavaScript'],
            publishedAt: '2026-09-28T00:00:00.000Z',
            url: 'https://k8o.me/blog/arianotify',
          },
        ],
      },
    },
    {
      type: 'tool-read_blog',
      toolCallId: 'call-2',
      state: 'output-error',
      input: { slug: 'missing' },
      errorText: '記事が見つかりません: missing',
    },
    {
      type: 'text',
      state: 'done',
      text: [
        '## まとめ',
        '',
        '- `ariaNotify()` は DOM を書き換えずに読み上げさせます',
        '- **ライブリージョン**を置かなくて済みます',
        '',
        '詳しくは[記事](https://k8o.me/blog/arianotify)を読んでください。',
        '一覧は https://k8o.me/blog にあります。',
        '',
        '| 方法 | DOM の変更 |',
        '| --- | --- |',
        '| ariaNotify メソッド | 要らない |',
        '| ライブリージョン | 要る |',
        '',
        '![図](https://example.com/figure.png)',
        '',
        '```ts',
        "document.ariaNotify('保存しました');",
        '```',
      ].join('\n'),
    },
  ],
};

const inProgressParts: AgentUIMessage['parts'] = [
  { type: 'step-start' },
  { type: 'reasoning', text: '本文を読んで比べる。', state: 'streaming' },
  {
    type: 'tool-read_blog',
    toolCallId: 'call-3',
    state: 'input-available',
    input: { slug: 'arianotify' },
  },
];

const PRICING: Spec = {
  root: 'title',
  elements: {
    title: { type: 'Heading', props: { level: 'h2', label: '料金プラン' } },
  },
};

const uiInput = { title: '料金プラン', instruction: '3つのプランを比べる' };

const uiAnswer: AgentUIMessage = {
  id: 'a5',
  role: 'assistant',
  metadata: { end: 'completed' },
  parts: [
    { type: 'step-start' },
    {
      type: 'tool-generate_ui',
      toolCallId: 'ui-done',
      state: 'output-available',
      input: uiInput,
      output: {
        status: 'done',
        artifactId: 'a1b2c3d4e5f6',
        version: 1,
        summary: '3つのプランを横に並べました。',
        spec: PRICING,
      },
    },
    {
      type: 'tool-generate_ui',
      toolCallId: 'ui-stopped',
      state: 'output-available',
      preliminary: true,
      input: { ...uiInput, title: '問い合わせフォーム' },
      output: { status: 'generating', phase: 'drawing', spec: PRICING },
    },
    {
      type: 'tool-generate_ui',
      toolCallId: 'ui-failed',
      state: 'output-error',
      input: { ...uiInput, title: 'ダッシュボード' },
      errorText: 'Error: UI の検証エラーを直せませんでした: [title] label',
    },
    { type: 'text', state: 'done', text: '料金プランの UI を作りました。' },
  ],
};

const uiGeneratingParts: AgentUIMessage['parts'] = [
  { type: 'step-start' },
  {
    type: 'tool-generate_ui',
    toolCallId: 'ui-generating',
    state: 'output-available',
    preliminary: true,
    input: {
      ...uiInput,
      base: { artifactId: 'a1b2c3d4e5f6', version: 1 },
    },
    output: { status: 'generating', phase: 'drawing', spec: PRICING },
  },
];

const DECK = ['<Cover>', '# TypeScript 入門', '</Cover>'].join('\n');

const slidesInput = {
  title: 'TypeScript 入門',
  instruction: '型の基礎を5枚で',
};

const slidesAnswer: AgentUIMessage = {
  id: 'a8',
  role: 'assistant',
  metadata: { end: 'completed' },
  parts: [
    { type: 'step-start' },
    {
      type: 'tool-generate_slides',
      toolCallId: 'slides-done',
      state: 'output-available',
      input: slidesInput,
      output: {
        status: 'done',
        artifactId: 's1t2u3v4w5x6',
        version: 1,
        summary: '型の基礎を5枚にまとめました。',
        source: DECK,
      },
    },
    {
      type: 'tool-generate_slides',
      toolCallId: 'slides-stopped-writing',
      state: 'output-available',
      preliminary: true,
      input: { ...slidesInput, title: '型の発展' },
      output: { status: 'generating', phase: 'writing', source: DECK },
    },
    {
      type: 'tool-generate_slides',
      toolCallId: 'slides-stopped-thinking',
      state: 'output-available',
      preliminary: true,
      input: { ...slidesInput, title: '型の応用' },
      output: { status: 'generating', phase: 'thinking', source: null },
    },
    {
      type: 'tool-generate_slides',
      toolCallId: 'slides-failed',
      state: 'output-error',
      input: { ...slidesInput, title: '型の歴史' },
      errorText:
        'Error: スライドを読み取れませんでした: デッキの中のコードブロックが閉じていません',
    },
    { type: 'text', state: 'done', text: '型の基礎のスライドを作りました。' },
  ],
};

const slidesGeneratingParts: AgentUIMessage['parts'] = [
  { type: 'step-start' },
  {
    type: 'tool-generate_slides',
    toolCallId: 'slides-generating',
    state: 'output-available',
    preliminary: true,
    input: slidesInput,
    output: { status: 'generating', phase: 'writing', source: DECK },
  },
];

// 保存するときに GitHub の tool の出力を置き換え、そのあとの思考の過程を外した返答
const withheldGithubAnswer: AgentUIMessage = {
  id: 'a10',
  role: 'assistant',
  metadata: { end: 'completed' },
  parts: [
    { type: 'step-start' },
    {
      type: 'reasoning',
      text: 'proxy.ts を読んで、認証の分かれ目を探す。',
      state: 'done',
    },
    {
      type: 'tool-read_github_file',
      toolCallId: 'github-read',
      state: 'output-available',
      input: { repo: 'k8o', path: 'apps/ai/src/proxy.ts' },
      output: WITHHELD_OUTPUT_TEXT,
    },
    { type: 'step-start' },
    {
      type: 'text',
      state: 'done',
      text: '`proxy.ts` は、公開ページのパスだけ認証を通さずに通します。',
    },
  ],
};

const REACT_POST_URL = 'https://react.dev/blog/2025/10/01/react-19-2';

const SEARCH_CIPHERTEXT = '検索の結果の暗号文';

const webSearchCall: AgentUIMessage['parts'][number] = {
  type: 'tool-web_search',
  toolCallId: 'web-search',
  providerExecuted: true,
  state: 'input-available',
  input: { query: 'React 19.2' },
};

const webFetchCall: AgentUIMessage['parts'][number] = {
  type: 'tool-web_fetch',
  toolCallId: 'web-fetch',
  providerExecuted: true,
  state: 'input-available',
  input: { url: REACT_POST_URL },
};

const webAnswerText: AgentUIMessage['parts'][number] = {
  type: 'text',
  state: 'done',
  text: `[React 19.2](${REACT_POST_URL}) で \`<Activity />\` が足されました。`,
};

// 受信した画面には、検索の結果と読んだページが残る
const liveWebAnswer: AgentUIMessage = {
  id: 'a11',
  role: 'assistant',
  metadata: { end: 'completed' },
  parts: [
    { type: 'step-start' },
    {
      ...webSearchCall,
      state: 'output-available',
      output: [
        {
          type: 'web_search_result',
          url: REACT_POST_URL,
          title: 'React 19.2 – React',
          pageAge: null,
          encryptedContent: SEARCH_CIPHERTEXT,
        },
        {
          type: 'web_search_result',
          url: 'https://example.com/react',
          title: null,
          pageAge: null,
          encryptedContent: SEARCH_CIPHERTEXT,
        },
      ],
    },
    {
      ...webFetchCall,
      state: 'output-available',
      output: {
        type: 'web_fetch_result',
        url: REACT_POST_URL,
        retrievedAt: '2026-10-21T10:30:00Z',
        content: {
          type: 'document',
          title: 'React 19.2 – React',
          source: {
            type: 'text',
            mediaType: 'text/plain',
            data: 'React 19.2 で <Activity /> を足しました。',
          },
        },
      },
    },
    {
      type: 'tool-web_fetch',
      toolCallId: 'web-fetch-pdf',
      providerExecuted: true,
      state: 'output-available',
      input: { url: 'https://example.com/paper.pdf' },
      output: {
        type: 'web_fetch_result',
        url: 'https://example.com/paper.pdf',
        retrievedAt: null,
        content: {
          type: 'document',
          title: null,
          source: {
            type: 'base64',
            mediaType: 'application/pdf',
            data: 'JVBERi0xLjQK',
          },
        },
      },
    },
    {
      type: 'tool-web_search',
      toolCallId: 'web-search-failed',
      providerExecuted: true,
      state: 'output-error',
      input: { query: 'React 20' },
      errorText:
        '{"type":"web_search_tool_result_error","errorCode":"too_many_requests"}',
    },
    webAnswerText,
  ],
};

// 保存するときに web の tool の結果を落として呼び出しだけに戻し、そのあとの思考の過程を外した返答
const withheldWebAnswer: AgentUIMessage = {
  id: 'a12',
  role: 'assistant',
  metadata: { end: 'completed' },
  parts: [
    { type: 'step-start' },
    {
      type: 'reasoning',
      text: 'React の最新のリリースを探す。',
      state: 'done',
    },
    webSearchCall,
    webFetchCall,
    webAnswerText,
  ],
};

const meta = preview.meta({
  component: AgentMessage,
  // propより狭い型（null）のままargsを推論させると meta.storyの型推論が壊れるため、
  // satisfiesで文脈型を与えて広げる
  args: {
    message: answer,
    isStreaming: false,
    isServerRunning: false,
    isStopping: false,
    selectedToolCallId: null,
    onOpenArtifact: fn<(toolCallId: string) => void>(),
  } satisfies Partial<ComponentProps<typeof AgentMessage>>,
});

export const UserMessage = meta.story({
  args: {
    message: {
      id: 'u1',
      role: 'user',
      parts: [{ type: 'text', text: 'a11y の記事を教えて' }],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('a11y の記事を教えて')).toBeInTheDocument();
  },
});

export const Answer = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 中身が空の reasoning は描かない
    await expect(
      canvas.getAllByRole('button', { name: '思考の過程' }),
    ).toHaveLength(1);
    await expect(
      canvas.getByRole('button', { name: /list_blogs/u }),
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: /read_blog/u }));
    await expect(
      canvas.getByText('記事が見つかりません: missing'),
    ).toBeVisible();
    await expect(
      canvas.getByRole('heading', { name: 'まとめ' }),
    ).toBeInTheDocument();
    await expect(canvas.getByText('ariaNotify()').tagName).toBe('CODE');
    await expect(canvas.getByRole('link', { name: /記事/u })).toHaveAttribute(
      'href',
      'https://k8o.me/blog/arianotify',
    );
    // 素の URL もリンクにする
    await expect(
      canvas.getByRole('link', { name: 'https://k8o.me/blog' }),
    ).toHaveAttribute('href', 'https://k8o.me/blog');
    await expect(
      canvas.getByRole('cell', { name: 'ライブリージョン' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText("document.ariaNotify('保存しました');"),
    ).toBeInTheDocument();
    await expect(canvas.queryByAltText('図')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
});

export const Streaming = meta.story({
  args: {
    message: { id: 'a2', role: 'assistant', parts: inProgressParts },
    isStreaming: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: '思考中…' }),
    ).toBeInTheDocument();
    const tool = canvas.getByRole('button', { name: /read_blog/u });
    await expect(within(tool).getByRole('status')).toBeInTheDocument();
  },
});

export const Stopped = meta.story({
  args: {
    message: {
      id: 'a3',
      role: 'assistant',
      metadata: { end: 'stopped' },
      parts: inProgressParts,
    },
    isStreaming: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 受信していない返答は、保存された state が streaming のままでも思考中にしない
    await expect(
      canvas.getByRole('button', { name: '思考の過程' }),
    ).toBeInTheDocument();
    const tool = canvas.getByRole('button', { name: /read_blog/u });
    await expect(within(tool).queryByRole('status')).not.toBeInTheDocument();
    await userEvent.click(tool);
    await expect(canvas.getByText('完了する前に止まりました')).toBeVisible();
    await expect(canvas.getByRole('alert')).toHaveTextContent('停止しました');
  },
});

export const ServerRunning = meta.story({
  args: {
    message: { id: 'a4', role: 'assistant', parts: inProgressParts },
    isServerRunning: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 受信していないので思考中にはしないが、サーバーで続いている tool の呼び出しは進行中にする
    await expect(
      canvas.getByRole('button', { name: '思考の過程' }),
    ).toBeInTheDocument();
    const tool = canvas.getByRole('button', { name: /read_blog/u });
    await expect(within(tool).getByRole('status')).toBeInTheDocument();
    await userEvent.click(tool);
    await expect(
      canvas.queryByText('完了する前に止まりました'),
    ).not.toBeInTheDocument();
  },
});

export const UiArtifacts = meta.story({
  args: { message: uiAnswer, selectedToolCallId: 'ui-done' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('料金プラン')).toBeInTheDocument();
    await expect(canvas.getByText('版 1')).toBeInTheDocument();
    await expect(
      canvas.getByText('3つのプランを横に並べました。'),
    ).toBeInTheDocument();
    // ペインに出ているカードでも、xl 未満のテストのビューポートではペインと同時に見えないので、開く口のまま出す
    await userEvent.click(
      canvas.getByRole('button', { name: 'プレビューを開く' }),
    );
    await expect(args.onOpenArtifact).toHaveBeenCalledWith('ui-done');
    await expect(canvas.getByText('表示中')).not.toBeVisible();
    // 生きていない返答に残った途中の出力は、止まったものとして途中まで開ける
    await expect(canvas.getByText('途中で止まりました')).toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: '途中までを見る' }),
    );
    await expect(args.onOpenArtifact).toHaveBeenLastCalledWith('ui-stopped');
    // 失敗は、Error: を外した文だけを出し、開くボタンを出さない
    await expect(
      canvas.getByText('UI の検証エラーを直せませんでした: [title] label'),
    ).toBeInTheDocument();
    await expect(
      canvas.getAllByRole('button', { name: /を開く|を見る|表示中/u }),
    ).toHaveLength(2);
    // spec の JSON を会話に流し込まない
    await expect(canvas.queryByText(/"root"/u)).not.toBeInTheDocument();
  },
});

export const GeneratingUi = meta.story({
  args: {
    message: { id: 'a6', role: 'assistant', parts: uiGeneratingParts },
    isStreaming: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('status', { name: '描いています…' }),
    ).toBeInTheDocument();
    await expect(canvas.getByText('版 1 を直しています')).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'プレビューを開く' }),
    ).toBeInTheDocument();
  },
});

export const StoppingUi = meta.story({
  args: {
    message: { id: 'a7', role: 'assistant', parts: uiGeneratingParts },
    isServerRunning: true,
    isStopping: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 止めているあいだは、サーバーを待っていても「生成を続けています」にしない
    await expect(
      canvas.getByRole('status', { name: '停止しています…' }),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByText(/生成を続けています/u),
    ).not.toBeInTheDocument();
  },
});

export const SlidesArtifacts = meta.story({
  args: { message: slidesAnswer, selectedToolCallId: 'slides-done' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('TypeScript 入門')).toBeInTheDocument();
    await expect(canvas.getByText('版 1')).toBeInTheDocument();
    await expect(
      canvas.getByText('型の基礎を5枚にまとめました。'),
    ).toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: 'プレビューを開く' }),
    );
    await expect(args.onOpenArtifact).toHaveBeenCalledWith('slides-done');
    // 書いている途中で止まったものは途中まで開けて、書く前に止まったものは開くものが無い
    await expect(canvas.getAllByText('途中で止まりました')).toHaveLength(2);
    await userEvent.click(
      canvas.getByRole('button', { name: '途中までを見る' }),
    );
    await expect(args.onOpenArtifact).toHaveBeenLastCalledWith(
      'slides-stopped-writing',
    );
    await expect(
      canvas.getByText(
        'スライドを読み取れませんでした: デッキの中のコードブロックが閉じていません',
      ),
    ).toBeInTheDocument();
    await expect(
      canvas.getAllByRole('button', { name: /を開く|を見る|表示中/u }),
    ).toHaveLength(2);
    // デッキの Markdown を会話に流し込まない
    await expect(canvas.queryByText(/<Cover>/u)).not.toBeInTheDocument();
  },
});

export const GeneratingSlides = meta.story({
  args: {
    message: { id: 'a9', role: 'assistant', parts: slidesGeneratingParts },
    isStreaming: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 生成中のスライドだけの返答も、行ごと隠さずにカードを出す
    await expect(
      canvas.getByRole('status', { name: 'スライドを書いています…' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'プレビューを開く' }),
    ).toBeInTheDocument();
  },
});

export const WithheldGithubOutput = meta.story({
  args: { message: withheldGithubAnswer },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: /read_github_file/u }),
    );
    // 出力は保存した決まった文になるが、何を読んだか（入力）は残る
    await expect(canvas.getByText(WITHHELD_OUTPUT_TEXT)).toBeVisible();
    await expect(canvas.getByText(/apps\/ai\/src\/proxy\.ts/u)).toBeVisible();
    await expect(
      canvas.getByText(/公開ページのパスだけ認証を通さずに通します/u),
    ).toBeInTheDocument();
  },
});

export const LiveWebOutputs = meta.story({
  args: { message: liveWebAnswer },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [search, failedSearch] = canvas.getAllByRole('button', {
      name: /web_search/u,
    });
    const [fetched, fetchedPdf] = canvas.getAllByRole('button', {
      name: /web_fetch/u,
    });
    if (
      search === undefined ||
      failedSearch === undefined ||
      fetched === undefined ||
      fetchedPdf === undefined
    ) {
      throw new Error('web の tool の呼び出しが描かれていません');
    }

    // 検索の結果は、暗号文を出さずに題と URL だけを並べる
    await userEvent.click(search);
    await expect(
      canvas.getByText(/^- React 19\.2 – React/u, { selector: 'pre' }),
    ).toHaveTextContent(
      `- React 19.2 – React ${REACT_POST_URL} - https://example.com/react https://example.com/react`,
    );
    await expect(
      canvas.queryByText(new RegExp(SEARCH_CIPHERTEXT, 'u')),
    ).not.toBeInTheDocument();

    // 読んだページは、URL と取得した日時、題、本文の順に出し、PDF は大きさだけを出す
    await userEvent.click(fetched);
    await expect(
      canvas.getByText(/に取得）/u, { selector: 'pre' }),
    ).toHaveTextContent(
      `${REACT_POST_URL}（2026-10-21T10:30:00Z に取得） React 19.2 – React React 19.2 で <Activity /> を足しました。`,
    );
    await userEvent.click(fetchedPdf);
    await expect(canvas.getByText(/PDF（9 バイト）/u)).toBeVisible();

    // 実行中に届いたエラーは、API の決まった値なのでそのまま出す
    await userEvent.click(failedSearch);
    await expect(canvas.getByText(/too_many_requests/u)).toBeVisible();
  },
});

export const WithheldWebCalls = meta.story({
  args: { message: withheldWebAnswer },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole('button', { name: /web_search/u });
    const fetched = canvas.getByRole('button', { name: /web_fetch/u });
    // 呼び出しだけのパーツも、止まって待っている表示にせず、保存していないことを出す
    await expect(within(search).queryByRole('status')).not.toBeInTheDocument();
    await userEvent.click(search);
    await userEvent.click(fetched);
    await expect(canvas.getAllByText(WITHHELD_OUTPUT_TEXT)).toHaveLength(2);
    await expect(
      canvas.getByText(/React 19\.2/u, { selector: 'pre' }),
    ).toBeVisible();
    await expect(
      canvas.queryByText('完了する前に止まりました'),
    ).not.toBeInTheDocument();
  },
});

export const RunningWebCall = meta.story({
  args: {
    message: {
      id: 'a13',
      role: 'assistant',
      parts: [{ type: 'step-start' }, webSearchCall],
    },
    isStreaming: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 受信している途中の呼び出しは、結果を待っている表示にする
    const search = canvas.getByRole('button', { name: /web_search/u });
    await expect(within(search).getByRole('status')).toBeInTheDocument();
    await userEvent.click(search);
    await expect(
      canvas.queryByText(WITHHELD_OUTPUT_TEXT),
    ).not.toBeInTheDocument();
  },
});
