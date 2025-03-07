import { CheckContrast } from './check-contrast';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof CheckContrast> = {
  title: 'app/colors/contrasts/check-contrast',
  component: CheckContrast,
};

export default meta;
type Story = StoryObj<typeof CheckContrast>;

export const Default: Story = {};
