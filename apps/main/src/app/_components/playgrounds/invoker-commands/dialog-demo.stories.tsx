import type { Meta, StoryObj } from '@storybook/react';
import { DialogDemo } from './dialog-demo';

const meta: Meta<typeof DialogDemo> = {
  component: DialogDemo,
  title: 'playgrounds/DialogDemo',
};

export default meta;
type Story = StoryObj<typeof DialogDemo>;

export const Default: Story = {};
