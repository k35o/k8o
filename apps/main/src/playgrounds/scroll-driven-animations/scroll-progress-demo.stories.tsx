import preview from '../../../.storybook/preview';
import { Playground } from '../playground';
import { ScrollProgressDemo } from './scroll-progress-demo';

const playgroundTitle = ScrollProgressDemo.name;

const meta = preview.meta({
  title: 'playgrounds/scroll-driven-animations/ScrollProgressDemo',
  component: ScrollProgressDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
