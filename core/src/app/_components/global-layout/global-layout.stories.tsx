import { GlobalLayout } from './global-layout';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof GlobalLayout> = {
  title: 'app/globals/global-layout',
  component: GlobalLayout,
};

export default meta;
type Story = StoryObj<typeof GlobalLayout>;

export const Primary: Story = {};
