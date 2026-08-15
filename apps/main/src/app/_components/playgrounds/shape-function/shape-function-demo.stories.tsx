import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { ShapeFunctionDemo } from './shape-function-demo';

const playgroundTitle = ShapeFunctionDemo.name;

const meta = preview.meta({
  title: 'playgrounds/shape-function/ShapeFunctionDemo',
  component: ShapeFunctionDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
