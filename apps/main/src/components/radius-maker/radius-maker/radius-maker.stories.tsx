import { PaletteIcon, SparklesIcon } from '@k8ordo/ui/icons';
import { expect, fireEvent, waitFor, within } from 'storybook/test';

import { BrowserSupportStatusLive } from '@/components/site/browser-support-status/browser-support-status-live';

import preview from '../../../../.storybook/preview';
import {
  interceptUrlNavigation,
  paramInUrl,
} from '../../../../.storybook/url-state-story';
import { RadiusMaker } from './radius-maker';

const meta = preview.meta({
  title: 'app/radius-maker/radius-maker',
  beforeEach: interceptUrlNavigation,
  component: RadiusMaker,
  args: {
    cornerShapeSupport: (
      <BrowserSupportStatusLive
        feature={{
          featureId: 'corner-shape',
          name: 'corner-shape',
          status: 'limited',
          baselineDate: null,
          resolvedDate: '2025-08-05',
          support: [
            { browser: 'chrome', version: '139', date: '2025-08-05' },
            { browser: 'chrome_android', version: '139', date: '2025-08-05' },
            { browser: 'edge', version: '139', date: '2025-08-05' },
          ],
        }}
        featureId="corner-shape"
      />
    ),
    previewIcon: <PaletteIcon />,
    randomIcon: <SparklesIcon />,
  },
});

export const Primary = meta.story();

export const InitialState = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const sliders = canvas.getAllByRole('slider');
    await expect(sliders).toHaveLength(8);

    const blobButton = canvas.getByRole('button', { name: 'ブロブ' });
    await expect(blobButton).toHaveAttribute('aria-pressed', 'true');

    await expect(
      canvas.getByText('border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;'),
    ).toBeInTheDocument();
  },
});

export const SelectPreset = meta.story({
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: '円' }));
    await expect(canvas.getByText('border-radius: 50%;')).toBeInTheDocument();

    const fields = canvas.getAllByRole('spinbutton', { name: '水平' });
    await Promise.all(fields.map((field) => expect(field).toHaveValue('50')));
  },
});

export const SelectCornerShape = meta.story({
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    await userEvent.selectOptions(
      canvas.getByRole('combobox', { name: 'かたち(corner-shape)' }),
      'squircle',
    );
    const code = canvasElement.querySelector('code');
    await expect(code?.textContent).toContain('corner-shape: squircle;');
  },
});

export const KeyboardOperation = meta.story({
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    const slider = canvas.getByRole('slider', {
      name: '左上の水平方向の丸み',
    });
    slider.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(slider).toHaveAttribute('aria-valuenow', '31');
    await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
    await expect(slider).toHaveAttribute('aria-valuenow', '21');
  },
});

export const OpenWithUrlValues = meta.story({
  parameters: { query: 'r=10,20,30,40,50,60,70,80&w=100&h=150&s=bevel' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const code = canvasElement.querySelector('code');
    await expect(code?.textContent).toContain(
      'border-radius: 10% 30% 50% 70% / 20% 40% 60% 80%;',
    );
    await expect(code?.textContent).toContain('corner-shape: bevel;');
    await expect(
      canvas.getByRole('spinbutton', { name: '幅(px)' }),
    ).toHaveValue('100');
    await expect(
      canvas.getByRole('spinbutton', { name: '高さ(px)' }),
    ).toHaveValue('150');
  },
});

export const CommitOnHandleRelease = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole('slider', {
      name: '左上の水平方向の丸み',
    });
    const frame = handle.parentElement?.getBoundingClientRect();
    if (frame === undefined) {
      throw new Error('枠がありません');
    }

    await fireEvent.pointerDown(handle, { pointerId: 1 });
    await waitFor(async () => {
      await expect(handle).toHaveAttribute('data-active', 'true');
    });
    for (const [ratio, value] of [
      [0.5, '50'],
      [0.6, '60'],
    ] as const) {
      await fireEvent.pointerMove(handle, {
        pointerId: 1,
        clientX: frame.left + frame.width * ratio,
        clientY: frame.top,
      });
      await waitFor(async () => {
        await expect(handle).toHaveAttribute('aria-valuenow', value);
      });
      await expect(paramInUrl('r')).toBeNull();
    }

    await fireEvent.pointerUp(handle, { pointerId: 1 });
    await expect(paramInUrl('r')).toBe('60,30,70,30,70,70,30,70');
  },
});

export const CommitOnKeyUp = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole('slider', {
      name: '左上の水平方向の丸み',
    });
    slider.focus();

    await userEvent.keyboard('{ArrowRight>3}');
    await expect(slider).toHaveAttribute('aria-valuenow', '33');
    await expect(paramInUrl('r')).toBeNull();

    await userEvent.keyboard('{/ArrowRight}');
    await expect(paramInUrl('r')).toBe('33,30,70,30,70,70,30,70');
    await expect(location.search).toContain(
      'r=33%2C30%2C70%2C30%2C70%2C70%2C30%2C70',
    );
  },
});

export const CommitSizeOnBlur = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('spinbutton', { name: '幅(px)' });

    await userEvent.clear(input);
    await userEvent.type(input, '999');
    await expect(paramInUrl('w')).toBeNull();

    await userEvent.tab();
    await expect(input).toHaveValue('320');
    await expect(paramInUrl('w')).toBe('320');
  },
});

export const WriteTemplateAndShapeAtOnce = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: '円' }));
    await expect(paramInUrl('r')).toBe('50,50,50,50,50,50,50,50');

    await userEvent.selectOptions(
      canvas.getByRole('combobox', { name: 'かたち(corner-shape)' }),
      'squircle',
    );
    await expect(paramInUrl('s')).toBe('squircle');
    await expect(paramInUrl('r')).toBe('50,50,50,50,50,50,50,50');
  },
});

export const WriteDefaultAsNoKey = meta.story({
  parameters: { query: 'r=10,20,30,40,50,60,70,80', vrt: { skip: true } },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'ブロブ' }));
    await expect(paramInUrl('r')).toBeNull();
  },
});
