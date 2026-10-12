import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { AnimationAccessorsDemo } from './animation-accessors-demo';

const playgroundTitle = AnimationAccessorsDemo.name;

const meta = preview.meta({
  title: 'playgrounds/animation-accessors/AnimationAccessorsDemo',
  component: AnimationAccessorsDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
