import { Dialog } from '../dialog';
import { Modal } from './modal';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

const meta: Meta<typeof Modal> = {
  title: 'components/modal',
  component: Modal,
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {
    children: (
      <Dialog.Root>
        <Dialog.Header title="Hello" onClose={fn()} />
        <Dialog.Content>World</Dialog.Content>
      </Dialog.Root>
    ),
  },
};
