import { expect, within } from 'storybook/test';

import preview from '../../../../../../.storybook/preview';
import { SignInForm } from './sign-in-form';

const meta = preview.meta({
  title: 'admin/sign-in/sign-in-form',
  component: SignInForm,
});

export const Primary = meta.story();

export const DisplaysGitHubLoginButton = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('GitHubでログイン')).toBeInTheDocument();
  },
});
