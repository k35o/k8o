import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, within } from 'storybook/test';

import { PaletteControls } from './palette-controls';

const meta: Meta<typeof PaletteControls> = {
  title: 'app/palette-maker/palette-controls',
  component: PaletteControls,
  args: {
    hue: 250,
    chroma: 0.15,
    name: 'primary',
    onHueChange: fn(() => {}),
    onChromaChange: fn(() => {}),
    onNameChange: fn(() => {}),
    onBaseColorChange: fn(() => {}),
  },
};

export default meta;
type Story = StoryObj<typeof PaletteControls>;

export const Primary: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sliders = canvas.getAllByRole('slider');
    await expect(sliders).toHaveLength(2);
    await expect(
      canvas.getByRole('textbox', { name: 'トークン名' }),
    ).toHaveValue('primary');
  },
};

export const ChangeHue: Story = {
  play: async ({ args, canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('spinbutton', { name: '色相 (H)' });
    input.focus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(args.onHueChange).toHaveBeenLastCalledWith(251);
  },
};

export const RenameToken: Story = {
  play: async ({ args, canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'トークン名' });
    await userEvent.clear(input);
    await userEvent.type(input, 'brand');
    await expect(args.onNameChange).toHaveBeenLastCalledWith('brand');
  },
};

export const InvalidTokenName: Story = {
  play: async ({ args, canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'トークン名' });
    await userEvent.clear(input);
    await userEvent.type(input, 'ABC');
    await expect(
      await canvas.findByText(
        '小文字英数字とハイフンで32文字以内で入力してください',
      ),
    ).toBeInTheDocument();
    await expect(args.onNameChange).not.toHaveBeenCalled();
  },
};

export const PasteBaseColor: Story = {
  play: async ({ args, canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: '基準色から取り込む' });
    await userEvent.type(input, '#ff0000');
    await expect(args.onBaseColorChange).toHaveBeenLastCalledWith({
      r: 1,
      g: 0,
      b: 0,
      alpha: 1,
    });
  },
};

export const InvalidBaseColor: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: '基準色から取り込む' });
    await userEvent.type(input, '#ff');
    await expect(
      await canvas.findByText('認識できない色形式です'),
    ).toBeInTheDocument();
  },
};
