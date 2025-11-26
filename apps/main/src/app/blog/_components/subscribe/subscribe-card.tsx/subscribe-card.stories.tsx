import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SubscribeCard } from './subscribe-card';

const meta: Meta<typeof SubscribeCard> = {
  title: 'app/blog/subscribe/subscribe-card',
  component: SubscribeCard,
};

export default meta;
type Story = StoryObj<typeof SubscribeCard>;

export const Primary: Story = {};
