import { expect, fireEvent, within } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import {
  expectParamInUrl,
  mountStoryUrl,
  paramInUrl,
} from '../../../../.storybook/url-state-story';
import { PALETTE_STEPS } from '../palette-types/palette-types';
import { PaletteMaker } from './palette-maker';

const meta = preview.meta({
  title: 'app/palette-maker/palette-maker',
  beforeEach: mountStoryUrl,
  component: PaletteMaker,
});

export const Primary = meta.story();

export const InitialState = meta.story({
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
});

export const ChangeHue = meta.story({
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
});

export const PasteBaseColor = meta.story({
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: '基準色から取り込む' });
    await userEvent.type(input, '#ff0000');
    const hue = canvas.getByRole('spinbutton', { name: '色相 (H)' });
    await expect(hue).toHaveAttribute('aria-valuenow', '29.2');
    const chroma = canvas.getByRole('spinbutton', { name: 'ピーク彩度 (C)' });
    await expect(chroma).toHaveAttribute('aria-valuenow', '0.258');
  },
});

export const PasteAchromaticBaseColor = meta.story({
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
});

export const RenameToken = meta.story({
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'トークン名' });
    await userEvent.clear(input);
    await userEvent.type(input, 'brand');
    await expect(
      await canvas.findByText(/--color-brand-500:/u),
    ).toBeInTheDocument();
  },
});

export const OpenWithUrlValues = meta.story({
  parameters: { query: 'h=30&c=0.2&name=brand' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('spinbutton', { name: '色相 (H)' }),
    ).toHaveAttribute('aria-valuenow', '30');
    await expect(
      canvas.getByRole('spinbutton', { name: 'ピーク彩度 (C)' }),
    ).toHaveAttribute('aria-valuenow', '0.2');
    await expect(
      canvas.getByRole('textbox', { name: 'トークン名' }),
    ).toHaveValue('brand');
    await expect(
      canvas.getByText(/--color-brand-500: oklch\(0\.66 0\.2 30\);/u),
    ).toBeInTheDocument();
  },
});

export const WriteWhileSliding = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole('slider', { name: '色相 (H)' });
    const number = canvas.getByRole('spinbutton', { name: '色相 (H)' });
    const entries = navigation.entries().length;

    for (const value of ['100', '101', '102']) {
      await fireEvent.change(slider, { target: { value } });
      await expect(number).toHaveAttribute('aria-valuenow', value);
    }

    await expectParamInUrl('h', '102');
    await expect(navigation.entries()).toHaveLength(entries);
  },
});

export const WriteOnStepperClick = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvasElement }) => {
    // aria-hidden なので role では取れない
    const increment = canvasElement.querySelector('button[tabindex="-1"]');
    if (increment === null) {
      throw new Error('段のボタンがありません');
    }

    await fireEvent.click(increment);
    await expectParamInUrl('h', '251');
  },
});

export const WriteWhileKeyHeld = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('spinbutton', { name: '色相 (H)' });
    input.focus();

    await userEvent.keyboard('{ArrowUp>3}');
    await expect(input).toHaveAttribute('aria-valuenow', '253');
    await expectParamInUrl('h', '253');
    await userEvent.keyboard('{/ArrowUp}');
    await expect(input).toHaveFocus();
  },
});

export const WritePeakChroma = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('spinbutton', { name: 'ピーク彩度 (C)' });

    await userEvent.clear(input);
    await userEvent.type(input, '0.2');
    await userEvent.tab();
    await expectParamInUrl('c', '0.2');
  },
});

export const RoundWhenWriting = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('spinbutton', { name: 'ピーク彩度 (C)' });

    await userEvent.clear(input);
    await userEvent.type(input, '0.12345');
    await userEvent.tab();
    await expectParamInUrl('c', '0.123');
  },
});

export const WriteNameOnEachInput = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'トークン名' });

    await userEvent.clear(input);
    await userEvent.type(input, 'b');
    await expectParamInUrl('name', 'b');
    await userEvent.type(input, 'rand');
    await expectParamInUrl('name', 'brand');
  },
});

export const NotWriteInvalidName = meta.story({
  parameters: { query: 'name=brand', vrt: { skip: true } },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'トークン名' });

    await userEvent.type(input, 'X');
    await expect(input).toHaveValue('brandX');
    // 書かれないことは待っても分からないので、あとの書き込みが URL に入った時点の値で確かめる
    await fireEvent.change(canvas.getByRole('slider', { name: '色相 (H)' }), {
      target: { value: '100' },
    });
    await expectParamInUrl('h', '100');
    await expect(paramInUrl('name')).toBe('brand');
  },
});

// メニューの貼り付けとドロップは input だけで、keyup も click も来ない
export const WriteBaseColorWithoutKeyUp = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: '基準色から取り込む' });

    await fireEvent.change(input, { target: { value: '#ff0000' } });
    await expectParamInUrl('h', '29.2');
    await expect(paramInUrl('c')).toBe('0.258');
  },
});

export const KeepOtherValuesWhenCommitting = meta.story({
  parameters: {
    query: 'zz=1&h=400&c=0.5',
    hash: '#x',
    vrt: { skip: true },
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('spinbutton', { name: '色相 (H)' }),
    ).toHaveAttribute('aria-valuenow', '360');
    await expect(paramInUrl('h')).toBe('400');

    const input = canvas.getByRole('textbox', { name: 'トークン名' });
    await userEvent.clear(input);
    await userEvent.type(input, 'a');

    await expectParamInUrl('name', 'a');
    await expect(paramInUrl('zz')).toBe('1');
    await expect(paramInUrl('h')).toBe('400');
    await expect(paramInUrl('c')).toBe('0.5');
    await expect(location.hash).toBe('#x');
  },
});
