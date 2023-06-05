import type { Meta, StoryObj } from '@storybook/react';
import { GlobalLayout } from './global-layout';

const meta: Meta<typeof GlobalLayout> = {
  title: 'common/global-layout',
  component: GlobalLayout,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GlobalLayout>;

export const Primary: Story = {};
