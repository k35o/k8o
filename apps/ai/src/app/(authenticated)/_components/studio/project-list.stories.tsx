import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import type { ProjectListItem } from '@/features/projects/application/projects';

import { ProjectList } from './project-list';

const projects: ProjectListItem[] = [
  {
    id: 1,
    title: 'お問い合わせフォーム',
    slug: 'abc123',
    visibility: 'private',
    updatedAt: '2026-06-22T09:30:00.000Z',
  },
  {
    id: 2,
    title: '料金プランの3カラム',
    slug: 'def456',
    visibility: 'public',
    updatedAt: '2026-06-21T18:05:00.000Z',
  },
];

const meta = {
  component: ProjectList,
} satisfies Meta<typeof ProjectList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    projects: [],
    currentProjectId: null,
    onSelect: fn<(projectId: number) => void>(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/まだ保存された UI はありません/u),
    ).toBeInTheDocument();
  },
};

export const WithProjects: Story = {
  args: {
    projects,
    currentProjectId: 1,
    onSelect: fn<(projectId: number) => void>(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('お問い合わせフォーム')).toBeInTheDocument();
    await expect(canvas.getByText(/公開/u)).toBeInTheDocument();
    await userEvent.click(canvas.getByText('料金プランの3カラム'));
    await expect(args.onSelect).toHaveBeenCalledWith(2);
  },
};
