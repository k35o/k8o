import type { Meta, StoryObj } from '@storybook/react';
import { RoundedIcon } from './rounded-icon';

const meta: Meta<typeof RoundedIcon> = {
  title: 'app/radius-maker/rounded-icon',
  component: RoundedIcon,
};

export default meta;
type Story = StoryObj<typeof RoundedIcon>;

export const Primary: Story = {};
