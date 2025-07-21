import { TooltipDropdownDemo } from './tooltip-dropdown-demo';
import { Playground } from '../playground';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta: Meta<typeof TooltipDropdownDemo> = {
  title: 'playgrounds/popover/TooltipDropdownDemo',
  component: TooltipDropdownDemo,
  decorators: [
    (Story) => (
      <Playground>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TooltipDropdownDemo>;

export const Default: Story = {};
