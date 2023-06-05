import type { Meta, StoryObj } from '@storybook/react';
import { AppCard } from './app-card';

const meta: Meta<typeof AppCard> = {
  title: 'characters/app-card',
  component: AppCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AppCard>;

export const Primary: Story = {};
