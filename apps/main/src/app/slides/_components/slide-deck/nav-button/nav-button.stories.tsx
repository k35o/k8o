import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { NavButton } from './nav-button';

const meta: Meta<typeof NavButton> = {
  title: 'app/slides/slide-deck/nav-button',
  component: NavButton,
  args: {
    onAction: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof NavButton>;

export const Prev: Story = {
  args: {
    direction: 'prev',
    disabled: false,
  },
};

export const Next: Story = {
  args: {
    direction: 'next',
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    direction: 'next',
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: '次のスライド' });
    await expect(button).toBeDisabled();
  },
};
