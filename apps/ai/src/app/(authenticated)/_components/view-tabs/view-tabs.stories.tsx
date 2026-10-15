import { expect, fn, userEvent, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { ViewTabs } from './view-tabs';

const options = [
  { value: 'preview', label: 'プレビュー' },
  { value: 'spec', label: 'spec' },
  { value: 'tsx', label: 'TSX' },
] as const;

const meta = preview.meta({
  component: ViewTabs,
});

export const Default = meta.story({
  args: {
    options,
    value: 'preview',
    onChange: fn<(value: string) => void>(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    // 選んでいるビューを、見た目だけでなく押された状態でも伝える
    await expect(
      canvas.getByRole('button', { name: 'プレビュー', pressed: true }),
    ).toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: 'spec', pressed: false }),
    );
    await expect(args.onChange).toHaveBeenCalledWith('spec');
  },
});
