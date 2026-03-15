import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { StatCard } from './stat-card';

const meta: Meta<typeof StatCard> = {
  title: 'admin/stat-card',
  component: StatCard,
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Primary: Story = {
  args: {
    label: '総閲覧数',
    value: '12,345',
  },
};

export const WithDescription: Story = {
  args: {
    label: '総閲覧数',
    value: '12,345',
    description: '先月比 +10%',
  },
};

export const DisplaysLabel: Story = {
  args: {
    label: 'コメント数',
    value: '42',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('コメント数')).toBeInTheDocument();
    await expect(canvas.getByText('42')).toBeInTheDocument();
  },
};
