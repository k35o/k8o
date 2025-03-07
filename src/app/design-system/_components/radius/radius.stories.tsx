import { Radius } from './radius';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Radius> = {
  title: 'app/design-system/radius',
  component: Radius,
};

export default meta;
type Story = StoryObj<typeof Radius>;

export const Primary: Story = {};
