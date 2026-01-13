import type { Meta, StoryObj } from '@storybook/react';
import { CustomCommandDemo } from './custom-command-demo';

const meta: Meta<typeof CustomCommandDemo> = {
  component: CustomCommandDemo,
  title: 'playgrounds/CustomCommandDemo',
};

export default meta;
type Story = StoryObj<typeof CustomCommandDemo>;

export const Default: Story = {};
