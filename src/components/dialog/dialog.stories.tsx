import { Dialog } from './dialog';
import { Button } from '../button';
import { Popover, useOpenContext } from '../popover';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { FC, HTMLProps } from 'react';

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
};
