import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { PrintColorAdjustDemo } from './print-color-adjust-demo';

const playgroundTitle = PrintColorAdjustDemo.name;

const meta = preview.meta({
  title: 'playgrounds/print-color-adjust/PrintColorAdjustDemo',
  component: PrintColorAdjustDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
