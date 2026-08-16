import { expect, fn, screen, userEvent, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { ShareControlView } from './share-control-view';

const meta = preview.meta({
  component: ShareControlView,
  args: {
    busy: false,
    onPublish: fn<() => void>(),
    onCopy: fn<() => void>(),
    onUnpublish: fn<() => void>(),
  },
});

export const Private = meta.story({
  args: { isPublic: false, hasDraft: false },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /共有/u }));
    await userEvent.click(await screen.findByText('公開する'));
    await expect(args.onPublish).toHaveBeenCalled();
  },
});

export const PublicNoDraft = meta.story({
  args: { isPublic: true, hasDraft: false },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /共有/u }));
    await expect(await screen.findByText('リンクをコピー')).toBeInTheDocument();
    await userEvent.click(screen.getByText('非公開にする'));
    await expect(args.onUnpublish).toHaveBeenCalled();
  },
});

export const PublicWithDraft = meta.story({
  args: { isPublic: true, hasDraft: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /共有/u }));
    await expect(
      await screen.findByText('変更を反映（再公開）'),
    ).toBeInTheDocument();
  },
});
