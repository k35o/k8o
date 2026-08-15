import { expect, fn, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { BLOB_CORNERS } from '../../_utils/presets';
import { CornerInputs } from './corner-inputs';

const meta = preview.meta({
  title: 'app/radius-maker/corner-inputs',
  component: CornerInputs,
});

export const Primary = meta.story({
  args: {
    corners: BLOB_CORNERS,
    onChangeValue: fn(() => {}),
  },
});

export const InputValue = meta.story({
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
});
