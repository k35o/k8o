import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { withProofreadState } from '../../_state/story-decorator';
import { InputPhase } from './input-phase';

const meta: Meta<typeof InputPhase> = {
  title: 'app/japanese-text-fixer/input-phase',
  component: InputPhase,
  decorators: [withProofreadState({})],
};

export default meta;
type Story = StoryObj<typeof InputPhase>;

export const Primary: Story = {};

export const InputText: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', {
      name: '校正したいテキスト',
    });
    await userEvent.type(textarea, '満点の星空が見れる。');

    const submitButton = canvas.getByRole('button', { name: '校正する' });
    await expect(submitButton).not.toBeDisabled();
  },
};

export const EmptyState: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', { name: '校正する' });
    await expect(submitButton).toBeDisabled();
  },
};
