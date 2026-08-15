import { expect, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { ApcaResultTable } from './apca-result-table';

const meta = preview.meta({
  title: 'app/contrast-checker/apca-result-table',
  component: ApcaResultTable,
});

export const AllValid = meta.story({
  args: {
    lc: 100,
  },
});

export const PartiallyValid = meta.story({
  args: {
    lc: 63,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Lc 63はLc 60/45/30/15を満たし、Lc 90/75を満たさない
    // モバイル表示とデスクトップ表示の両方がDOMに存在するため2倍になる
    await expect(canvas.getAllByText('OK')).toHaveLength(8);
    await expect(canvas.getAllByText('NG')).toHaveLength(4);
  },
});

export const AllInvalid = meta.story({
  args: {
    lc: 10,
  },
});

export const NegativeLc = meta.story({
  args: {
    lc: -80,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 負のLc値は絶対値で判定されるため、Lc -80はLc 75以下の基準を満たす
    await expect(canvas.getAllByText('OK')).toHaveLength(10);
    await expect(canvas.getAllByText('NG')).toHaveLength(2);
  },
});
