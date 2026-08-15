import { expect, fn, within } from 'storybook/test';

import preview from '../../../../../../.storybook/preview';
import { NavButton } from './nav-button';

const meta = preview.meta({
  title: 'app/slides/slide-deck/nav-button',
  component: NavButton,
  args: {
    onAction: fn(() => undefined),
  },
});

export const Prev = meta.story({
  args: {
    direction: 'prev',
    disabled: false,
  },
  play: async ({ args, canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '前のスライド' }));
    await expect(args.onAction).toHaveBeenCalledTimes(1);
  },
});

export const Next = meta.story({
  args: {
    direction: 'next',
    disabled: false,
  },
  play: async ({ args, canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '次のスライド' }));
    await expect(args.onAction).toHaveBeenCalledTimes(1);
  },
});

export const Disabled = meta.story({
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
});
