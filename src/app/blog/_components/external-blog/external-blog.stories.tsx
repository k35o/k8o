import type { Meta, StoryObj } from '@storybook/react';
import { ExternalBlog } from './external-blog';

const meta: Meta<typeof ExternalBlog> = {
  title: 'app/blog/external-blog',
  component: ExternalBlog,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ExternalBlog>;

export const Primary: Story = {};
