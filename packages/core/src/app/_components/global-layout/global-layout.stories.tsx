import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { GlobalLayout } from './global-layout';

const meta: Meta<typeof GlobalLayout> = {
  title: 'app/globals/global-layout',
  component: GlobalLayout,
};

export default meta;
type Story = StoryObj<typeof GlobalLayout>;

export const Primary: Story = {};
