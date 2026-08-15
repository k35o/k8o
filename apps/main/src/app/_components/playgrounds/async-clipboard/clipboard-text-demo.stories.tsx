import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { ClipboardTextDemo } from './clipboard-text-demo';

const playgroundTitle = ClipboardTextDemo.name;

const meta = preview.meta({
  title: 'playgrounds/async-clipboard/ClipboardTextDemo',
  component: ClipboardTextDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
