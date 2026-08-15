import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { ContentVisibilityDemo } from './content-visibility-demo';

const playgroundTitle = ContentVisibilityDemo.name;

const meta = preview.meta({
  title: 'playgrounds/content-visibility/ContentVisibilityDemo',
  component: ContentVisibilityDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
