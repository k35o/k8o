import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { SiblingProgressDemo } from './sibling-progress-demo';

const playgroundTitle = SiblingProgressDemo.name;

const meta = preview.meta({
  title: 'playgrounds/progress-function/SiblingProgressDemo',
  component: SiblingProgressDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
