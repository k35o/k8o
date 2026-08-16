import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { BaselineShiftDemo } from './baseline-shift-demo';

const playgroundTitle = BaselineShiftDemo.name;

const meta = preview.meta({
  title: 'playgrounds/baseline-shift/BaselineShiftDemo',
  component: BaselineShiftDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
