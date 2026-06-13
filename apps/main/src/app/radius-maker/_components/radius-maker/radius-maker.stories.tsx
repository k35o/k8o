import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { RadiusMaker } from './radius-maker';

const meta: Meta<typeof RadiusMaker> = {
  title: 'app/radius-maker/radius-maker',
  component: RadiusMaker,
};

export default meta;
type Story = StoryObj<typeof RadiusMaker>;

export const Primary: Story = {};

export const InitialState: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 8つのドラッグハンドルがスライダーとして存在する
    const sliders = canvas.getAllByRole('slider');
    await expect(sliders).toHaveLength(8);

    // 初期状態はブロブプリセットが選択されている
    const blobButton = canvas.getByRole('button', { name: 'ブロブ' });
    await expect(blobButton).toHaveAttribute('aria-pressed', 'true');

    // 初期状態のCSSが表示されている
    await expect(
      canvas.getByText('border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;'),
    ).toBeInTheDocument();
  },
};

export const SelectPreset: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // 円プリセットを選ぶと簡約された1値のCSSになる
    await userEvent.click(canvas.getByRole('button', { name: '円' }));
    await expect(canvas.getByText('border-radius: 50%;')).toBeInTheDocument();

    // 数値入力にも反映される
    const fields = canvas.getAllByRole('spinbutton', { name: '水平' });
    await Promise.all(fields.map((field) => expect(field).toHaveValue('50')));
  },
};

export const SelectCornerShape: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // corner-shapeを選ぶと出力CSSに反映され、Baselineの対応状況が表示される
    await userEvent.selectOptions(
      canvas.getByRole('combobox', { name: 'かたち(corner-shape)' }),
      'squircle',
    );
    const code = canvasElement.querySelector('code');
    await expect(code?.textContent).toContain('corner-shape: squircle;');
  },
};

export const KeyboardOperation: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // 矢印キーで1ずつ、Shift+矢印キーで10ずつ値が変わる
    const slider = canvas.getByRole('slider', {
      name: '左上の水平方向の丸み',
    });
    slider.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(slider).toHaveAttribute('aria-valuenow', '31');
    await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
    await expect(slider).toHaveAttribute('aria-valuenow', '21');
  },
};
