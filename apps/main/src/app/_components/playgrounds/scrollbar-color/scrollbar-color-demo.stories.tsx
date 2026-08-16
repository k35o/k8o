import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { ScrollbarColorDemo } from './scrollbar-color-demo';

const playgroundTitle = ScrollbarColorDemo.name;

const meta = preview.meta({
  title: 'playgrounds/scrollbar-color/ScrollbarColorDemo',
  component: ScrollbarColorDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
