import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { SignOutButton } from './sign-out-button';

const meta: Meta<typeof SignOutButton> = {
  title: 'admin/sign-out-button',
  component: SignOutButton,
};

export default meta;
type Story = StoryObj<typeof SignOutButton>;

export const Primary: Story = {};

export const DisplaysLogoutButton: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('ログアウト')).toBeInTheDocument();
  },
};
