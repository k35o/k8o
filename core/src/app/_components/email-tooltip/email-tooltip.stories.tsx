import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { EmailTooltip } from './email-tooltip';

const meta: Meta<typeof EmailTooltip> = {
  title: 'app/globals/email-tooltip',
  component: EmailTooltip,
};

export default meta;
type Story = StoryObj<typeof EmailTooltip>;

export const Primary: Story = {};
