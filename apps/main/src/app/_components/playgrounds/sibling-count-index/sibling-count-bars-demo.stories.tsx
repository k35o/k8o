import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { SiblingCountBarsDemo } from './sibling-count-bars-demo';

const playgroundTitle = SiblingCountBarsDemo.name;

const meta = preview.meta({
  title: 'playgrounds/sibling-count-index/SiblingCountBarsDemo',
  component: SiblingCountBarsDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
