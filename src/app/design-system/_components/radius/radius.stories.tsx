import type { Meta, StoryObj } from '@storybook/react';
import { Radius } from './radius';

const meta: Meta<typeof Radius> = {
  title: 'app/design-system/radius',
  component: Radius,
};

export default meta;
type Story = StoryObj<typeof Radius>;

export const Primary: Story = {};
