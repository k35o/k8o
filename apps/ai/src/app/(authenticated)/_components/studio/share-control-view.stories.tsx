import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

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

// 非公開: 主操作の「公開」ボタンだけ。クリックで onPublish が呼ばれる。
export const Private: Story = {
  args: { isPublic: false, hasDraft: false },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const publish = canvas.getByRole('button', { name: '公開' });
    await expect(publish).toBeInTheDocument();
    await userEvent.click(publish);
    await expect(args.onPublish).toHaveBeenCalled();
  },
};

// 公開中・差分なし: 更新 / リンク / 非公開 の3ボタン。
export const PublicNoDraft: Story = {
  args: { isPublic: true, hasDraft: false },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: '更新' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'リンク' }),
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '非公開' }));
    await expect(args.onUnpublish).toHaveBeenCalled();
  },
};

// 公開中・未公開の変更あり: 「未公開の変更あり」表示 + 更新ボタン。
export const PublicWithDraft: Story = {
  args: { isPublic: true, hasDraft: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('未公開の変更あり')).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: '更新' }),
    ).toBeInTheDocument();
  },
};
