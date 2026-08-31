import { Button } from '@k8ordo/ui';
import type { ComponentProps } from 'react';
import { expect, within } from 'storybook/test';

import type { ProjectListItem } from '@/features/projects/application/projects';

import preview from '../../../../../.storybook/preview';
import { StudioShell } from './studio-shell';

const noop = (): void => {
  // 見た目確認用のダミーハンドラ
};

const projects: ProjectListItem[] = [
  {
    id: 1,
    title: '料金プランの3カラム',
    slug: 'a1b2c3',
    visibility: 'public',
    publishedVersionId: 10,
    updatedAt: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 2,
    title: 'お問い合わせフォーム',
    slug: 'd4e5f6',
    visibility: 'private',
    publishedVersionId: null,
    updatedAt: '2026-07-28T18:30:00.000Z',
  },
];

const meta = preview.meta({
  component: StudioShell,
  decorators: [
    (Story) => (
      <div className="bg-bg-surface flex h-160 flex-col">
        <Story />
      </div>
    ),
  ],
  // propより狭い型（unionリテラル・null・[]）のままargsを推論させると
  // meta.storyの型推論が壊れるため、satisfiesで文脈型を与えて広げる
  args: {
    tool: 'ui',
    projects,
    currentProjectId: 1,
    onSelectProject: noop,
    onNewProject: noop,
    header: (
      <>
        <span className="text-fg-base truncate text-sm font-medium">
          料金プランの3カラム
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button color="primary" size="sm" variant="solid">
            プレビュー
          </Button>
          <Button color="primary" size="sm" variant="skeleton">
            spec
          </Button>
        </div>
      </>
    ),
    children: (
      <div className="text-fg-mute flex flex-1 items-center justify-center text-sm">
        メインコンテンツ
      </div>
    ),
  } satisfies Partial<ComponentProps<typeof StudioShell>>,
});

export const Default = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // サイドバーにツール切替・新規作成・プロジェクト一覧が集約されている。
    const nav = canvas.getByRole('navigation', { name: 'AI ツール' });
    await expect(within(nav).getByText('UI')).toBeInTheDocument();
    await expect(within(nav).getByText('スライド')).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: /新規作成/u }),
    ).toBeInTheDocument();
    // プロジェクト一覧はサイドバー（complementary）内にある。ヘッダのタイトルと
    // 重複しうるためスコープして探す。
    const sidebar = within(canvas.getByRole('complementary'));
    await expect(sidebar.getByText('料金プランの3カラム')).toBeInTheDocument();
    await expect(sidebar.getByText('お問い合わせフォーム')).toBeInTheDocument();
    // 現在地（UI）は aria-current でマークされる。
    const current = within(nav).getByText('UI').closest('a');
    await expect(current).toHaveAttribute('aria-current', 'page');
  },
});

export const SlidesTool = meta.story({
  args: {
    tool: 'slides',
    projectsEmptyText:
      'まだ保存されたスライドはありません。生成すると自動で履歴に残ります。',
    projects: [],
    currentProjectId: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: 'AI ツール' });
    const current = within(nav).getByText('スライド').closest('a');
    await expect(current).toHaveAttribute('aria-current', 'page');
    await expect(
      canvas.getByText(/まだ保存されたスライドはありません/u),
    ).toBeInTheDocument();
  },
});
