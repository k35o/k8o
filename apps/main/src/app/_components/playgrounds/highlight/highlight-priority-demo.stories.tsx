import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { HighlightPriorityDemo } from './highlight-priority-demo';

const playgroundTitle = HighlightPriorityDemo.name;

const meta = preview.meta({
  title: 'playgrounds/highlight/HighlightPriorityDemo',
  component: HighlightPriorityDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
