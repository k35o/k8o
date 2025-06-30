import { ClipboardTextDemo } from './clipboard-text-demo';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof ClipboardTextDemo> = {
  title: 'playgrounds/async-clipboard/ClipboardTextDemo',
  component: ClipboardTextDemo,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ClipboardTextDemo>;

export const Default: Story = {};
