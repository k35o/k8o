import type { Meta, StoryObj } from '@storybook/react-vite';
import { type FC, type HTMLProps, useState } from 'react';
import { fn } from 'storybook/test';
import { Button } from '../button';
import { Modal } from '../modal';
import { Popover, useOpenContext } from '../popover';
import { Dialog } from './dialog';

const meta: Meta<typeof Dialog.Root> = {
  title: 'components/dialog',
  component: Dialog.Root,
};

export default meta;
type Story = StoryObj<typeof Dialog.Root>;

export const Default: Story = {
  render: () => (
    <Dialog.Root>
      <Dialog.Header onClose={fn} title="ダイアログ" />
      <Dialog.Content>こんにちは</Dialog.Content>
    </Dialog.Root>
  ),
};

const StoryDialog: FC<HTMLProps<HTMLElement>> = (props) => {
  const { onClose } = useOpenContext();
  return (
    <Dialog.Root {...props} ref={props.ref}>
      <Dialog.Header onClose={onClose} title="ダイアログ" />
      <Dialog.Content>こんにちはこんにちはこんにちはこんにちは</Dialog.Content>
    </Dialog.Root>
  );
};

export const PopoverDialog: Story = {
  render: () => (
    <Popover.Root type="dialog">
      <Popover.Trigger
        renderItem={(props) => (
          <Button {...props} size="md" type="button">
            ポップオーバー
          </Button>
        )}
      />
      <Popover.Content renderItem={(props) => <StoryDialog {...props} />} />
    </Popover.Root>
  ),
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', {
      name: 'ポップオーバー',
    });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
  },
  parameters: {
    a11y: {
      options: {
        rules: {
          // https://github.com/floating-ui/floating-ui/pull/2298#issuecomment-1518101512
          'aria-hidden-focus': { enabled: false },
        },
      },
    },
  },
};

export const ModalDialog: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button
          onClick={() => {
            setOpen(true);
          }}
          size="md"
          type="button"
        >
          モーダル
        </Button>
        <Modal
          isOpen={open}
          onClose={() => {
            setOpen(false);
          }}
          type="center"
        >
          <Dialog.Root>
            <Dialog.Header onClose={fn} title="モーダル" />
            <Dialog.Content>こんにちは</Dialog.Content>
          </Dialog.Root>
        </Modal>
      </>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', {
      name: 'モーダル',
    });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
  },
};
