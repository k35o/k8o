import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, within } from 'storybook/test';

import { NavButton } from './nav-button';

const meta: Meta<typeof NavButton> = {
  title: 'app/slides/slide-deck/nav-button',
  component: NavButton,
  args: {
    onAction: fn(() => undefined),
  },
};

export default meta;
type Story = StoryObj<typeof NavButton>;

export const Prev: Story = {
  args: {
    direction: 'prev',
    disabled: false,
  },
  play: async ({ args, canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '前のスライド' }));
    await expect(args.onAction).toHaveBeenCalledTimes(1);
  },
};

export const Next: Story = {
  args: {
    direction: 'next',
    disabled: false,
  },
  play: async ({ args, canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '次のスライド' }));
    await expect(args.onAction).toHaveBeenCalledTimes(1);
  },
};

export const Disabled: Story = {
  args: {
    direction: 'next',
    disabled: true,
  },
  play: async ({ args, canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: '次のスライド' });
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onAction).not.toHaveBeenCalled();
  },
};
