import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { SignInForm } from './sign-in-form';

const meta: Meta<typeof SignInForm> = {
  title: 'admin/sign-in/sign-in-form',
  component: SignInForm,
};

export default meta;
type Story = StoryObj<typeof SignInForm>;

export const Primary: Story = {};

export const DisplaysGitHubLoginButton: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('GitHubでログイン')).toBeInTheDocument();
  },
};
