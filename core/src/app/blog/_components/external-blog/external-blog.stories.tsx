import { ExternalBlog } from './external-blog';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta: Meta<typeof ExternalBlog> = {
  title: 'app/blog/external-blog',
  component: ExternalBlog,
};

export default meta;
type Story = StoryObj<typeof ExternalBlog>;

export const Primary: Story = {};
