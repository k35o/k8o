import { expect, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { ProjectTitle } from './project-title';

const meta = preview.meta({
  component: ProjectTitle,
});

export const NewProject = meta.story({
  args: {
    pendingTitle: null,
    projectId: null,
    projectTitle: null,
    newProjectLabel: '新しいプロジェクト',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('新しいプロジェクト')).toBeInTheDocument();
  },
});

export const SelectedProject = meta.story({
  args: {
    pendingTitle: null,
    projectId: 1,
    projectTitle: 'お問い合わせフォーム',
    newProjectLabel: '新しいプロジェクト',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('お問い合わせフォーム')).toBeInTheDocument();
  },
});

export const Pending = meta.story({
  args: {
    // 読込中はプロジェクト未確定でも選んだタイトルを先行表示する。
    pendingTitle: '料金プランの3カラム',
    projectId: null,
    projectTitle: null,
    newProjectLabel: '新しいプロジェクト',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('料金プランの3カラム')).toBeInTheDocument();
  },
});
