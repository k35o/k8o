import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { WakeLockDemo } from './wake-lock-demo';

const playgroundTitle = WakeLockDemo.name;

const meta = preview.meta({
  title: 'playgrounds/screen-wake-lock/WakeLockDemo',
  component: WakeLockDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
