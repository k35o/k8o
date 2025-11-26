import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { TooltipDropdownDemo } from './tooltip-dropdown-demo';

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
