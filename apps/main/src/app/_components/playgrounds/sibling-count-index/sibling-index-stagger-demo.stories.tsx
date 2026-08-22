import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { SiblingIndexStaggerDemo } from './sibling-index-stagger-demo';

const playgroundTitle = SiblingIndexStaggerDemo.name;

const meta = preview.meta({
  title: 'playgrounds/sibling-count-index/SiblingIndexStaggerDemo',
  component: SiblingIndexStaggerDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
