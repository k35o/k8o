import type { Meta, StoryObj } from '@storybook/react-vite';
import { Separator } from './separator';

const meta: Meta<typeof Separator> = {
  title: 'components/separator',
  component: Separator,
  decorators: [
    (Story) => {
      return (
        <div className="size-40">
          <Story />
        </div>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
};
