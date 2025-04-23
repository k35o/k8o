import { TalkCard } from './talk-card';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof TalkCard> = {
  title: 'app/talks/talk-card',
  component: TalkCard,
};

export default meta;
type Story = StoryObj<typeof TalkCard>;

export const Primary: Story = {};
