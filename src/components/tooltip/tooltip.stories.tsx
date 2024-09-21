import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './tooltip';
import { cn } from '@/utils/cn';

const meta: Meta<typeof Tooltip.Root> = {
  title: 'components/tooltip',
  component: Tooltip.Root,
};

export default meta;
type Story = StoryObj<typeof Tooltip.Root>;

export const Default: Story = {
  render: () => (
    <Tooltip.Root placement="bottom-start">
      <Tooltip.Trigger
        renderItem={(props) => (
          <button
            type="button"
            className={cn(
              'rounded-xl font-bold',
              'bg-buttonPrimary text-textOnFill hover:bg-buttonHover active:bg-buttonActive',
              'focus-visible:border-borderTransparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-borderFocus',
              'text-md px-4 py-2',
              'flex items-center justify-between gap-2',
            )}
            {...props}
          >
            Tooltip
          </button>
        )}
      />
      <Tooltip.Content>
        <p>Tooltip content</p>
      </Tooltip.Content>
    </Tooltip.Root>
  ),
};
