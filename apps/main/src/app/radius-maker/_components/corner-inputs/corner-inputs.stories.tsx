import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, within } from 'storybook/test';

import { BLOB_CORNERS } from '../../_utils/presets';
import { CornerInputs } from './corner-inputs';

const meta: Meta<typeof CornerInputs> = {
  title: 'app/radius-maker/corner-inputs',
  component: CornerInputs,
};

export default meta;
type Story = StoryObj<typeof CornerInputs>;

export const Primary: Story = {
  args: {
    corners: BLOB_CORNERS,
    onChangeValue: fn(() => {}),
  },
};

export const InputValue: Story = {
  args: {
    corners: BLOB_CORNERS,
    onChangeValue: fn(() => {}),
  },
  play: async ({ args, canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    const fields = canvas.getAllByRole('spinbutton');
    await expect(fields).toHaveLength(8);

    const firstField = fields[0];
    if (!firstField) {
      throw new Error('数値入力フィールドが見つかりません');
    }
    await userEvent.clear(firstField);
    await userEvent.type(firstField, '42');
    await userEvent.tab();
    await expect(args.onChangeValue).toHaveBeenLastCalledWith(
      'topLeft',
      'x',
      42,
    );
  },
};
