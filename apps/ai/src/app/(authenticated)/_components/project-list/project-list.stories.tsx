import { expect, within } from 'storybook/test';

import type { ProjectListItem } from '@/features/projects/application/projects';

import preview from '../../../../../.storybook/preview';
import { ProjectList } from './project-list';

const projects: ProjectListItem[] = [
  {
    id: 1,
    title: 'お問い合わせフォーム',
    slug: 'abc123',
    visibility: 'private',
    publishedVersionId: null,
    updatedAt: '2026-06-22T09:30:00.000Z',
  },
  {
    id: 2,
    title: '料金プランの3カラム',
    slug: 'def456',
    visibility: 'public',
    publishedVersionId: 7,
    updatedAt: '2026-06-21T18:05:00.000Z',
  },
];

const meta = preview.meta({
  component: ProjectList,
});

export const Empty = meta.story({
  args: {
    projects: [],
    basePath: '/',
    currentProjectId: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/まだ保存された UI はありません/u),
    ).toBeInTheDocument();
  },
});

export const WithProjects = meta.story({
  args: {
    projects,
    basePath: '/',
    currentProjectId: 1,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const current = canvas.getByRole('link', {
      name: /お問い合わせフォーム/u,
    });
    await expect(current).toHaveAttribute('href', '/?project=1');
    await expect(current).toHaveAttribute('aria-current', 'page');
    // 更新日時は日本時間で出す
    await expect(within(current).getByText('06/22 18:30')).toBeInTheDocument();

    const other = canvas.getByRole('link', { name: /料金プランの3カラム/u });
    await expect(other).toHaveAttribute('href', '/?project=2');
    await expect(other).not.toHaveAttribute('aria-current');
    await expect(within(other).getByText(/公開/u)).toBeInTheDocument();
  },
});
