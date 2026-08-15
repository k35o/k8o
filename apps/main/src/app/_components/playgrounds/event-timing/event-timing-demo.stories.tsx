import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { EventTimingDemo } from './event-timing-demo';

const playgroundTitle = EventTimingDemo.name;

const meta = preview.meta({
  title: 'playgrounds/event-timing/EventTimingDemo',
  component: EventTimingDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
