import { Color } from './color';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Color> = {
  title: 'app/design-system/color',
  component: Color,
};

export default meta;
type Story = StoryObj<typeof Color>;

export const Primary: Story = {};
