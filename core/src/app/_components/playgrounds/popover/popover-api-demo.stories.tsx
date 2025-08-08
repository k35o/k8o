import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { PopoverApiDemo } from './popover-api-demo';

const meta: Meta<typeof PopoverApiDemo> = {
  title: 'playgrounds/popover/PopoverApiDemo',
  component: PopoverApiDemo,
  decorators: [
    (Story) => (
      <Playground>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PopoverApiDemo>;

export const Default: Story = {};
