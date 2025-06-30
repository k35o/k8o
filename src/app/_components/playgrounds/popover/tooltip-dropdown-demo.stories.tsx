import { TooltipDropdownDemo } from './tooltip-dropdown-demo';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof TooltipDropdownDemo> = {
  title: 'playgrounds/popover/TooltipDropdownDemo',
  component: TooltipDropdownDemo,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof TooltipDropdownDemo>;

export const Default: Story = {};
