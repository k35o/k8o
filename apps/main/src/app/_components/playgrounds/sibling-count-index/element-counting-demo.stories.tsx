import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { ElementCountingDemo } from './element-counting-demo';

const playgroundTitle = ElementCountingDemo.name;

const meta = preview.meta({
  title: 'playgrounds/sibling-count-index/ElementCountingDemo',
  component: ElementCountingDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
