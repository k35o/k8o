import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { AdminHeader } from './admin-header';

const meta: Meta<typeof AdminHeader> = {
  title: 'admin/admin-header',
  component: AdminHeader,
};

export default meta;
type Story = StoryObj<typeof AdminHeader>;

export const Primary: Story = {};

export const DisplaysNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('k8o')).toBeInTheDocument();
    await expect(canvas.getByText('Admin')).toBeInTheDocument();
    await expect(
      canvas.getByRole('link', { name: 'よんでいるもの' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('link', { name: 'レポート' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('link', { name: 'Baseline' }),
    ).toBeInTheDocument();
  },
};
