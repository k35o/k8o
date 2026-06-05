import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { CommentList } from './comment-list';

const meta: Meta<typeof CommentList> = {
  title: 'admin/comments/comment-list',
  component: CommentList,
};

export default meta;
type Story = StoryObj<typeof CommentList>;

export const Primary: Story = {
  args: {
    items: [
      {
        id: 1,
        message: 'とても参考になりました。ありがとうございます！',
        createdAt: '2025-05-01T10:00:00Z',
        feedbackName: 'とても良かった',
        blogSlug: 'react-19-use',
      },
      {
        id: 2,
        message:
          '誤字を見つけました。3段落目の「使う」が「使お」になっています。',
        createdAt: '2025-04-20T08:30:00Z',
        feedbackName: null,
        blogSlug: null,
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('とても参考になりました。ありがとうございます！'),
    ).toBeInTheDocument();
    await expect(
      canvas.getAllByRole('button', { name: '削除' }).length,
    ).toBeGreaterThan(0);
  },
};

export const Empty: Story = {
  args: {
    items: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('条件に一致するお問い合わせはありません'),
    ).toBeInTheDocument();
  },
};
