import { DialogRequestCloseDemo } from './dialog-requestclose-demo';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof DialogRequestCloseDemo> = {
  title: 'playgrounds/requestclose/DialogRequestCloseDemo',
  component: DialogRequestCloseDemo,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof DialogRequestCloseDemo>;

export const Default: Story = {};
