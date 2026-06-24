import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, screen, userEvent, within } from 'storybook/test';

import { ShareControlView } from './share-control-view';

const meta = {
  component: ShareControlView,
  args: {
    busy: false,
    onPublish: fn<() => void>(),
    onCopy: fn<() => void>(),
    onUnpublish: fn<() => void>(),
  },
} satisfies Meta<typeof ShareControlView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Private: Story = {
  args: { isPublic: false, hasDraft: false },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /共有/u }));
    await userEvent.click(await screen.findByText('公開する'));
    await expect(args.onPublish).toHaveBeenCalled();
  },
};

export const PublicNoDraft: Story = {
  args: { isPublic: true, hasDraft: false },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /共有/u }));
    await expect(await screen.findByText('リンクをコピー')).toBeInTheDocument();
    await userEvent.click(screen.getByText('非公開にする'));
    await expect(args.onUnpublish).toHaveBeenCalled();
  },
};

export const PublicWithDraft: Story = {
  args: { isPublic: true, hasDraft: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /共有/u }));
    await expect(
      await screen.findByText('変更を反映（再公開）'),
    ).toBeInTheDocument();
  },
};
