import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { PopoverApiDemo } from './popover-api-demo';

const playgroundTitle = PopoverApiDemo.name;

const meta = preview.meta({
  title: 'playgrounds/popover/PopoverApiDemo',
  component: PopoverApiDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
