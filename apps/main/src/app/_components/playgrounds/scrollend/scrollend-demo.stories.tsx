import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { ScrollendDemo } from './scrollend-demo';

const playgroundTitle = ScrollendDemo.name;

const meta = preview.meta({
  title: 'playgrounds/scrollend/ScrollendDemo',
  component: ScrollendDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
