import { NewsLink } from './news-link';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta: Meta<typeof NewsLink> = {
  title: 'app/globals/global-layout/news-link',
  component: NewsLink,
};

export default meta;
type Story = StoryObj<typeof NewsLink>;

export const Primary: Story = {};
