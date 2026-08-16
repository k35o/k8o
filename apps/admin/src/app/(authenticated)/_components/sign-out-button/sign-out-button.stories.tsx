import { expect, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { SignOutButton } from './sign-out-button';

const meta = preview.meta({
  title: 'admin/sign-out-button',
  component: SignOutButton,
});

export const Primary = meta.story();

export const DisplaysLogoutButton = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('ログアウト')).toBeInTheDocument();
  },
});
