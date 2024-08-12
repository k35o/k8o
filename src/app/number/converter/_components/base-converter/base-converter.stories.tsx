import type { Meta, StoryObj } from '@storybook/react';
import { BaseConverter } from './base-converter';

const meta: Meta<typeof BaseConverter> = {
  title: 'app/number/converter/base-converter',
  component: BaseConverter,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BaseConverter>;

export const Primary: Story = {};
