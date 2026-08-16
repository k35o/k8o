import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { DialogRequestCloseDemo } from './dialog-requestclose-demo';

const playgroundTitle = DialogRequestCloseDemo.name;

const meta = preview.meta({
  title: 'playgrounds/requestclose/DialogRequestCloseDemo',
  component: DialogRequestCloseDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
