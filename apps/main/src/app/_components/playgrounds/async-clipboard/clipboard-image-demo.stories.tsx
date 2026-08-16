import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { ClipboardImageDemo } from './clipboard-image-demo';

const playgroundTitle = ClipboardImageDemo.name;

const meta = preview.meta({
  title: 'playgrounds/async-clipboard/ClipboardImageDemo',
  component: ClipboardImageDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
