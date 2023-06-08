import type { Meta, StoryObj } from '@storybook/react';
import { BlogCard } from './blog-card';

const meta: Meta<typeof BlogCard> = {
  title: 'characters/blog/blog-card',
  component: BlogCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BlogCard>;

export const Primary: Story = {};
