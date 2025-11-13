import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BaseConverter } from './base-converter';

const meta: Meta<typeof BaseConverter> = {
  title: 'app/base-converter/base-converter',
  component: BaseConverter,
};

export default meta;
type Story = StoryObj<typeof BaseConverter>;

export const Primary: Story = {};
