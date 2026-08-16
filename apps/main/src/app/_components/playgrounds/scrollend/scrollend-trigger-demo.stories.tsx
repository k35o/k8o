import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { ScrollendTriggerDemo } from './scrollend-trigger-demo';

const playgroundTitle = ScrollendTriggerDemo.name;

const meta = preview.meta({
  title: 'playgrounds/scrollend/ScrollendTriggerDemo',
  component: ScrollendTriggerDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
