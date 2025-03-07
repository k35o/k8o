import { Modal } from './modal';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Modal> = {
  title: 'components/modal',
  component: Modal,
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {
    title: 'Modal',
    children: 'Hello',
  },
};
