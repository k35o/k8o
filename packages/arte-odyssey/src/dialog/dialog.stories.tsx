import { Dialog } from './dialog';
import { Button } from '../button';
import { Modal } from '../modal';
import { Popover, useOpenContext } from '../popover';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FC, HTMLProps, useState } from 'react';
import { fn, userEvent, within } from 'storybook/test';

const meta: Meta<typeof Dialog.Root> = {
  title: 'components/dialog',
  component: Dialog.Root,
};

export default meta;
type Story = StoryObj<typeof Dialog.Root>;

export const Default: Story = {
  render: () => (
    <Dialog.Root>
      <Dialog.Header title="ダイアログ" onClose={fn} />
      <Dialog.Content>こんにちは</Dialog.Content>
    </Dialog.Root>
  ),
};

const StoryDialog: FC<HTMLProps<HTMLElement>> = (props) => {
  const { onClose } = useOpenContext();
  return (
    <Dialog.Root {...props} ref={props.ref}>
      <Dialog.Header title="ダイアログ" onClose={onClose} />
      <Dialog.Content>
        こんにちはこんにちはこんにちはこんにちは
      </Dialog.Content>
    </Dialog.Root>
  );
};

export const PopoverDialog: Story = {
  render: () => (
    <Popover.Root type="dialog">
      <Popover.Trigger
        renderItem={(props) => (
          <Button {...props} type="button" size="md">
            ポップオーバー
          </Button>
        )}
      />
      <Popover.Content
        renderItem={(props) => <StoryDialog {...props} />}
      />
    </Popover.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
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
          type="button"
          size="md"
          onClick={() => {
            setOpen(true);
          }}
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
            <Dialog.Header title="モーダル" onClose={fn} />
            <Dialog.Content>こんにちは</Dialog.Content>
          </Dialog.Root>
        </Modal>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: 'モーダル',
    });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
  },
};
