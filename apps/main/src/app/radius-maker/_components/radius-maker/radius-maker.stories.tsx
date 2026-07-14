import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { expect, within } from 'storybook/test';

import { RadiusMaker } from './radius-maker';

const meta: Meta<typeof RadiusMaker> = {
  title: 'app/radius-maker/radius-maker',
  component: RadiusMaker,
  decorators: [
    (Story) => (
      <NuqsTestingAdapter>
        <Story />
      </NuqsTestingAdapter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RadiusMaker>;

export const Primary: Story = {};

export const InitialState: Story = {
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
};

export const SelectPreset: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: '円' }));
    await expect(canvas.getByText('border-radius: 50%;')).toBeInTheDocument();

    const fields = canvas.getAllByRole('spinbutton', { name: '水平' });
    await Promise.all(fields.map((field) => expect(field).toHaveValue('50')));
  },
};

export const SelectCornerShape: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

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
