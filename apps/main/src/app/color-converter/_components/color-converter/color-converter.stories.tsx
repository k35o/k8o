import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { ColorConverter } from './color-converter';

const meta: Meta<typeof ColorConverter> = {
  title: 'app/color-converter/color-converter',
  component: ColorConverter,
};

export default meta;
type Story = StoryObj<typeof ColorConverter>;

export const Primary: Story = {};

export const InitialState: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 統一入力は初期色 #5eead4 を hex で表示する。
    const input = canvas.getByRole('textbox', { name: 'カラーコード' });
    await expect(input).toHaveValue('#5eead4');

    // 既定タブ(RGB)が初期色の各成分を表示する。
    await expect(canvas.getByRole('spinbutton', { name: 'R' })).toHaveValue(
      '94',
    );
    await expect(canvas.getByRole('spinbutton', { name: 'G' })).toHaveValue(
      '234',
    );
    await expect(canvas.getByRole('spinbutton', { name: 'B' })).toHaveValue(
      '212',
    );
  },
};

// 課題2: rgb() を丸ごと貼り付けできる。
export const PasteRgb: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('textbox', { name: 'カラーコード' });
    await userEvent.clear(input);
    await userEvent.type(input, 'rgb(255, 0, 0)');

    await expect(canvas.getByRole('spinbutton', { name: 'R' })).toHaveValue(
      '255',
    );
    await expect(canvas.getByRole('spinbutton', { name: 'G' })).toHaveValue(
      '0',
    );
    // 対応表（RGB行）だけが rgb(...) 文字列を持つ。
    await expect(canvas.getByText('rgb(255, 0, 0)')).toBeInTheDocument();
  },
};

// 課題2/3: モダンCSSの oklch() も貼り付け・変換できる。
export const PasteOklch: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('textbox', { name: 'カラーコード' });
    await userEvent.clear(input);
    await userEvent.type(input, 'oklch(62.8% 0.2577 29.23)');

    // エラーにならず、赤系（R が高い）へ変換される。
    await expect(
      canvas.queryByText('認識できない色形式です'),
    ).not.toBeInTheDocument();
    const red = canvas.getByRole('spinbutton', { name: 'R' });
    await expect(Number((red as HTMLInputElement).value)).toBeGreaterThan(250);
  },
};

// 課題1: 入力途中の不正値でプレビューが白へ飛ばない（直前の有効色を保つ）。
export const IncompleteInputKeepsColor: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('textbox', { name: 'カラーコード' });
    await userEvent.clear(input);
    await userEvent.type(input, 'rgb(255 0 0)');
    await expect(canvas.getByRole('spinbutton', { name: 'G' })).toHaveValue(
      '0',
    );

    // 未完成な hex を入力するとエラー表示になるが、色は赤のまま（白=255,255,255 に飛ばない）。
    await userEvent.clear(input);
    await userEvent.type(input, '#ff');
    await expect(
      await canvas.findByText('認識できない色形式です'),
    ).toBeInTheDocument();
    await expect(canvas.getByRole('spinbutton', { name: 'R' })).toHaveValue(
      '255',
    );
    await expect(canvas.getByRole('spinbutton', { name: 'G' })).toHaveValue(
      '0',
    );
  },
};

// 課題2/4: 数値フィールドでの微調整が対応表へ反映される。
export const EditChannel: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    const blue = canvas.getByRole('spinbutton', { name: 'B' });
    await userEvent.clear(blue);
    await userEvent.type(blue, '0');
    // NumberField は blur 時に値を確定する。
    await userEvent.tab();

    // #5eead4 の B を 0 にすると rgb(94, 234, 0) になる。
    await expect(canvas.getByText('rgb(94, 234, 0)')).toBeInTheDocument();
  },
};
