import { Subscribe } from './subscribe';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta: Meta<typeof Subscribe> = {
  title: 'app/blog/subscribe',
  component: Subscribe,
};

export default meta;
type Story = StoryObj<typeof Subscribe>;

export const Primary: Story = {};

export const IsOpen: Story = {
  play: async ({ canvas, userEvent }) => {
    const button = await canvas.findByRole('button', {
      name: 'ブログの購読',
    });
    await userEvent.click(button);
  },
};
