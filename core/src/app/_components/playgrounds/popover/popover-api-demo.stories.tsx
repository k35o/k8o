import { PopoverApiDemo } from './popover-api-demo';
import { Playground } from '../playground';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

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
