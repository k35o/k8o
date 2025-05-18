import { TalkCard } from './talk-card';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof TalkCard> = {
  title: 'app/talks/talk-card',
  component: TalkCard,
};

export default meta;
type Story = StoryObj<typeof TalkCard>;

export const Primary: Story = {
  args: {
    title: 'Talk Title',
    eventUrl: 'https://example.com',
    eventName: 'Event Name',
    eventDate: '2023-01-01',
    eventLocation: 'Event Location',
    slideUrl: 'https://example.com/slides',
    blog: {
      id: 1,
      slug: 'blog-slug',
    },
    tags: [
      { id: 1, name: 'Tag 1' },
      { id: 2, name: 'Tag 2' },
    ],
  },
};
