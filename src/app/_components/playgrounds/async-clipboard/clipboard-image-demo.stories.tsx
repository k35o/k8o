import { ClipboardImageDemo } from './clipboard-image-demo';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof ClipboardImageDemo> = {
  title: 'playgrounds/async-clipboard/ClipboardImageDemo',
  component: ClipboardImageDemo,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ClipboardImageDemo>;

export const Default: Story = {};
