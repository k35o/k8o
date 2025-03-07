import { BaseConverter } from './base-converter';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof BaseConverter> = {
  title: 'app/base-converter/base-converter',
  component: BaseConverter,
};

export default meta;
type Story = StoryObj<typeof BaseConverter>;

export const Primary: Story = {};
