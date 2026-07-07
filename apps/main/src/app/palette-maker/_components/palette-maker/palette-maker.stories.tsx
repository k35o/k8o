import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { PALETTE_STEPS } from '../../_types/palette';
import { PaletteMaker } from './palette-maker';

const meta: Meta<typeof PaletteMaker> = {
  title: 'app/palette-maker/palette-maker',
  component: PaletteMaker,
};

export default meta;
type Story = StoryObj<typeof PaletteMaker>;

export const Primary: Story = {};

export const InitialState: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('slider')).toHaveLength(2);
    await expect(
      canvas.getByText(/--color-primary-500: oklch\(0\.66 0\.12 250\);/u),
    ).toBeInTheDocument();
    const table = canvas.getByRole('table');
    await expect(within(table).getAllByRole('row')).toHaveLength(
      PALETTE_STEPS.length + 1,
    );
  },
};

export const ChangeHue: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('spinbutton', { name: '色相 (H)' });
    input.focus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(input).toHaveAttribute('aria-valuenow', '251');
    await expect(
      await canvas.findByText(
        /--color-primary-500: oklch\(0\.66 0\.12 251\);/u,
      ),
    ).toBeInTheDocument();
  },
};

export const PasteBaseColor: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: '基準色から取り込む' });
    await userEvent.type(input, '#ff0000');
    const hue = canvas.getByRole('spinbutton', { name: '色相 (H)' });
    await expect(hue).toHaveAttribute('aria-valuenow', '29.2');
    const chroma = canvas.getByRole('spinbutton', { name: 'ピーク彩度 (C)' });
    await expect(chroma).toHaveAttribute('aria-valuenow', '0.258');
  },
};

export const PasteAchromaticBaseColor: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const hue = canvas.getByRole('spinbutton', { name: '色相 (H)' });
    const hueBefore = hue.getAttribute('aria-valuenow');
    const input = canvas.getByRole('textbox', { name: '基準色から取り込む' });
    await userEvent.type(input, 'white');
    const chroma = canvas.getByRole('spinbutton', { name: 'ピーク彩度 (C)' });
    await expect(chroma).toHaveAttribute('aria-valuenow', '0');
    // 無彩色の取り込みでは色相を動かさない
    await expect(hue.getAttribute('aria-valuenow')).toBe(hueBefore);
  },
};

export const RenameToken: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'トークン名' });
    await userEvent.clear(input);
    await userEvent.type(input, 'brand');
    await expect(
      await canvas.findByText(/--color-brand-500:/u),
    ).toBeInTheDocument();
  },
};
