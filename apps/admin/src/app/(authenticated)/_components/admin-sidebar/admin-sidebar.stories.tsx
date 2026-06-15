import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { AdminSidebar } from './admin-sidebar';

const meta: Meta<typeof AdminSidebar> = {
  title: 'admin/admin-sidebar',
  component: AdminSidebar,
};

export default meta;
type Story = StoryObj<typeof AdminSidebar>;

export const Primary: Story = {};

export const HighlightsActiveRoute: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/comments',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const link = canvas.getAllByText('お問い合わせ')[0]?.closest('a') ?? null;
    await expect(link).toHaveAttribute('aria-current', 'page');
  },
};
