import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Dialog } from '../dialog';
import { Modal } from './modal';

const meta: Meta<typeof Modal> = {
  title: 'components/modal',
  component: Modal,
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {
    defaultOpen: true,
    children: (
      <Dialog.Root>
        <Dialog.Header onClose={fn()} title="Hello" />
        <Dialog.Content>World</Dialog.Content>
      </Dialog.Root>
    ),
  },
};
