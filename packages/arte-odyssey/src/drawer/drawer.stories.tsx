import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Drawer } from './drawer';

const meta: Meta<typeof Drawer> = {
  title: 'components/drawer',
  component: Drawer,
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: fn(),
    title: 'Drawer Title',
    children: (
      <div className="flex flex-col gap-4">
        <p className="text-fg-mute">
          This is a drawer component. You can put any content here.
        </p>
        <p className="text-fg-mute">
          You can use it to display additional information or actions related to
          the current context.
        </p>
        <p className="text-fg-mute">
          You can also use it to display forms, lists, or any other type of
          content that you want to show in a drawer.
        </p>
        <p className="text-fg-mute">
          This is a great way to keep your UI clean and organized while still
          providing access to important information or actions.
        </p>
      </div>
    ),
  },
};
