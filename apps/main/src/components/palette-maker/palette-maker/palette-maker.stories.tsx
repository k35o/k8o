import { expect, fireEvent, waitFor, within } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import {
  interceptUrlNavigation,
  paramInUrl,
} from '../../../../.storybook/url-state-story';
import { PALETTE_STEPS } from '../palette-types/palette-types';
import { PaletteMaker } from './palette-maker';

const meta = preview.meta({
  title: 'app/palette-maker/palette-maker',
  beforeEach: interceptUrlNavigation,
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

export const CommitOnSliderRelease = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole('slider', { name: '色相 (H)' });
    const number = canvas.getByRole('spinbutton', { name: '色相 (H)' });

    for (const value of ['100', '101', '102']) {
      await fireEvent.change(slider, { target: { value } });
      await expect(number).toHaveAttribute('aria-valuenow', value);
      await expect(paramInUrl('h')).toBeNull();
    }

    await fireEvent.pointerUp(slider);
    await expect(paramInUrl('h')).toBe('102');
    await expect(number).toHaveAttribute('aria-valuenow', '102');
  },
});

export const CommitOnPointerCancel = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole('slider', { name: '色相 (H)' });

    await fireEvent.change(slider, { target: { value: '100' } });
    await expect(paramInUrl('h')).toBeNull();

    await fireEvent.pointerCancel(slider);
    await expect(paramInUrl('h')).toBe('100');
  },
});

// 段のボタンは keyup も blur も待たずに値が変わる
export const CommitOnStepperClick = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvasElement }) => {
    // aria-hidden なので role では取れない
    const increment = canvasElement.querySelector('button[tabindex="-1"]');
    if (increment === null) {
      throw new Error('段のボタンがありません');
    }

    await fireEvent.click(increment);
    await expect(paramInUrl('h')).toBe('251');
  },
});

// 支援技術の増減は input と change だけで、ポインタもキーも出ない
export const CommitWhenSettled = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole('slider', { name: '色相 (H)' });

    await fireEvent.change(slider, { target: { value: '100' } });
    await expect(paramInUrl('h')).toBeNull();

    await waitFor(
      async () => {
        await expect(paramInUrl('h')).toBe('100');
      },
      { timeout: 2000 },
    );
  },
});

export const NotCommitWhileChanging = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole('slider', { name: '色相 (H)' });

    for (const value of ['100', '101', '102', '103']) {
      await fireEvent.change(slider, { target: { value } });
      await expect(paramInUrl('h')).toBeNull();
      await new Promise((resolve) => {
        setTimeout(resolve, 250);
      });
    }

    await waitFor(
      async () => {
        await expect(paramInUrl('h')).toBe('103');
      },
      { timeout: 2000 },
    );
  },
});

export const CommitOnKeyUp = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('spinbutton', { name: '色相 (H)' });
    const entries = navigation.entries().length;
    input.focus();

    await userEvent.keyboard('{ArrowUp>3}');
    await expect(input).toHaveAttribute('aria-valuenow', '253');
    await expect(paramInUrl('h')).toBeNull();

    await userEvent.keyboard('{/ArrowUp}');
    await expect(paramInUrl('h')).toBe('253');
    await expect(input).toHaveFocus();
    await expect(navigation.entries()).toHaveLength(entries);
  },
});

export const CommitOnBlur = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('spinbutton', { name: 'ピーク彩度 (C)' });

    await userEvent.clear(input);
    await userEvent.type(input, '0.2');
    await expect(paramInUrl('c')).toBeNull();

    await userEvent.tab();
    await expect(paramInUrl('c')).toBe('0.2');
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
    await expect(paramInUrl('c')).toBe('0.123');
  },
});

export const WriteNameOnEachInput = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'トークン名' });

    await userEvent.clear(input);
    await expect(paramInUrl('name')).toBeNull();
    await userEvent.type(input, 'b');
    await expect(paramInUrl('name')).toBe('b');
    await userEvent.type(input, 'rand');
    await expect(paramInUrl('name')).toBe('brand');

    await userEvent.type(input, 'X');
    await expect(paramInUrl('name')).toBe('brand');
    await expect(
      canvas.getByRole('textbox', { name: 'トークン名' }),
    ).toHaveValue('brandX');
  },
});

// メニューの貼り付けとドロップは input だけで、keyup も click も来ない
export const WriteBaseColorWithoutKeyUp = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: '基準色から取り込む' });

    await fireEvent.change(input, { target: { value: '#ff0000' } });
    await waitFor(async () => {
      await expect(paramInUrl('h')).toBe('29.2');
    });
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

    await expect(paramInUrl('zz')).toBe('1');
    await expect(paramInUrl('h')).toBe('400');
    await expect(paramInUrl('c')).toBe('0.5');
    await expect(paramInUrl('name')).toBe('a');
    await expect(location.hash).toBe('#x');
  },
});
