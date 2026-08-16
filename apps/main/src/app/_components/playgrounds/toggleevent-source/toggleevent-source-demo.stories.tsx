import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { ToggleEventSourceDemo } from './toggleevent-source-demo';

const playgroundTitle = ToggleEventSourceDemo.name;

const meta = preview.meta({
  title: 'playgrounds/toggleevent-source/ToggleEventSourceDemo',
  component: ToggleEventSourceDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
