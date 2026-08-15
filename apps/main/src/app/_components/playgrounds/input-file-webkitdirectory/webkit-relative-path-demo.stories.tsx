import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { WebkitRelativePathDemo } from './webkit-relative-path-demo';

const playgroundTitle = WebkitRelativePathDemo.name;

const meta = preview.meta({
  title: 'playgrounds/input-file-webkitdirectory/WebkitRelativePathDemo',
  component: WebkitRelativePathDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
