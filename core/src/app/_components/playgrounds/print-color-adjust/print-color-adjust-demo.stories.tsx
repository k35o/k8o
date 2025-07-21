import { PrintColorAdjustDemo } from './print-color-adjust-demo';
import { Playground } from '../playground';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta: Meta<typeof PrintColorAdjustDemo> = {
  title: 'playgrounds/print-color-adjust/PrintColorAdjustDemo',
  component: PrintColorAdjustDemo,
  decorators: [
    (Story) => (
      <Playground>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PrintColorAdjustDemo>;

export const Default: Story = {};
