import { expect, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { ReadingCard } from './reading-card';

const meta = preview.meta({
  title: 'app/reading-list/reading-card',
  component: ReadingCard,
  args: {
    articleId: 1,
    url: 'https://example.com/article',
    title: 'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
    publishedAt: '2026-05-20T00:00:00Z',
    imageUrl: '/icon-192.png',
    description:
      'Reactのルーティングには主にNext.js等のフレームワークやReact Routerが利用されます。この記事では新たな選択肢としてTanStack Routerを紹介します。',
    summary: null,
    summaryGaveUp: false,
    sourceTitle: 'Zenn',
  },
});

export const WithSummary = meta.story({
  args: {
    summary:
      '型安全なルーティングを提供するTanStack Routerの入門記事。ファイルベースルーティング、検索パラメータの型付け、データローダー、コード分割、認証ガードまで、実プロジェクトで必要になる要素を一通り順を追って解説している。Next.jsやReact Routerからの移行も具体例つきで触れられている。',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AI 生成であることを示すラベルが表示される
    await expect(canvas.getByText('AI要約')).toBeInTheDocument();
    // 要約は省略されず全文表示される
    await expect(
      canvas.getByText(
        /型安全なルーティングを提供するTanStack Routerの入門記事。/u,
      ),
    ).toBeInTheDocument();
    await expect(canvas.getByText('Zenn')).toBeInTheDocument();
  },
});

export const AutoGenerateOnView = meta.story({
  args: {
    summary: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 未要約の記事はビューポート進入で自動生成され、要約とラベルが差し込まれる
    // （article-actions はモックされ、固定のモック要約を返す）
    await expect(await canvas.findByText('AI要約')).toBeInTheDocument();
    await expect(
      await canvas.findByText(/モック要約：型安全なルーティングを提供する/u),
    ).toBeInTheDocument();
  },
});

export const NoImage = meta.story({
  args: {
    imageUrl: null,
    summary:
      '型安全なルーティングを提供するTanStack Routerの入門記事。実プロジェクトで必要になる要素を一通り解説している。',
  },
});

export const SummaryGaveUp = meta.story({
  args: {
    summary: null,
    summaryGaveUp: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 上限まで失敗した記事は生成を試みず、説明文のまま確定表示する
    await expect(
      canvas.getByText(/Reactのルーティングには主に/u),
    ).toBeInTheDocument();
    // 「生成中…」も「AI要約」ラベルも出ない
    await expect(canvas.queryByText('AI要約を生成中…')).not.toBeInTheDocument();
    await expect(canvas.queryByText('AI要約')).not.toBeInTheDocument();
  },
});
