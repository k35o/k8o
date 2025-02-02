import type { Meta, StoryObj } from '@storybook/react';
import { Color } from './color';

const meta: Meta<typeof Color> = {
  title: 'app/design-system/color',
  component: Color,
};

export default meta;
type Story = StoryObj<typeof Color>;

export const Primary: Story = {};
