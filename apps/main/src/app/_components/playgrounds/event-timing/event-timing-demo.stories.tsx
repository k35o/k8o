import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { EventTimingDemo } from './event-timing-demo';

const playgroundTitle = EventTimingDemo.name;

const meta: Meta<typeof EventTimingDemo> = {
  title: 'playgrounds/event-timing/EventTimingDemo',
  component: EventTimingDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof EventTimingDemo>;

export const Default: Story = {};
