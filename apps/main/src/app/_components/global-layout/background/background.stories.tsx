import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Background } from './background';

const meta: Meta<typeof Background> = {
  title: 'app/globals/global-layout/background',
  component: Background,
};

export default meta;
type Story = StoryObj<typeof Background>;

export const Primary: Story = {};
