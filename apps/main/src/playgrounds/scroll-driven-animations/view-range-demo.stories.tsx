import preview from '../../../.storybook/preview';
import { Playground } from '../playground';
import { ViewRangeDemo } from './view-range-demo';

const playgroundTitle = ViewRangeDemo.name;

const meta = preview.meta({
  title: 'playgrounds/scroll-driven-animations/ViewRangeDemo',
  component: ViewRangeDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
