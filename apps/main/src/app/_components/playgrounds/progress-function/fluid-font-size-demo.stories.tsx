import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { FluidFontSizeDemo } from './fluid-font-size-demo';

const playgroundTitle = FluidFontSizeDemo.name;

const meta = preview.meta({
  title: 'playgrounds/progress-function/FluidFontSizeDemo',
  component: FluidFontSizeDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
