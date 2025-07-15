import { Subscribe } from './subscribe';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { userEvent, within } from 'storybook/test';

const meta: Meta<typeof Subscribe> = {
  title: 'app/blog/subscribe',
  component: Subscribe,
};

export default meta;
type Story = StoryObj<typeof Subscribe>;

export const Primary: Story = {};

export const IsOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByRole('button', {
      name: 'ブログの購読',
    });
    await userEvent.click(button);
  },
};
