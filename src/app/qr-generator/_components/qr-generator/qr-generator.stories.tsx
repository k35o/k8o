import { QrGenerator } from './qr-generator';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof QrGenerator> = {
  title: 'app/qr-generator/QrGenerator',
  component: QrGenerator,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof QrGenerator>;

export const Default: Story = {};
