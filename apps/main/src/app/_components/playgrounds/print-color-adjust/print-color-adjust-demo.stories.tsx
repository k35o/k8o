import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { PrintColorAdjustDemo } from './print-color-adjust-demo';

const playgroundTitle = PrintColorAdjustDemo.name;

const meta: Meta<typeof PrintColorAdjustDemo> = {
  title: 'playgrounds/print-color-adjust/PrintColorAdjustDemo',
  component: PrintColorAdjustDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PrintColorAdjustDemo>;

export const Default: Story = {};
