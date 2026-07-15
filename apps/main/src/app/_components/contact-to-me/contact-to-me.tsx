'use client';

import {
  Anchor,
  Button,
  Dialog,
  FormControl,
  IconButton,
  Modal,
  SendIcon,
  Textarea,
  useToast,
} from '@k8o/arte-odyssey';
import { useActionState, useCallback, useState } from 'react';
import type { FC } from 'react';

import { contact } from '@/features/contact/interface/actions';

export const ContactToMe: FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <IconButton label="お問い合わせ" onClick={onOpen}>
        <SendIcon size="lg" />
      </IconButton>
      <ContactToMeModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};

const ContactToMeModal: FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { onOpen: onToastOpen } = useToast();

  const handleAction = useCallback(
    async (
      prevState: Awaited<ReturnType<typeof contact>>,
      formData: FormData,
    ) => {
      const result = await contact(prevState, formData);
      if (result.success === true) {
        onToastOpen('success', 'お問い合わせの送信に成功しました');
        onClose();
      }
      return result;
    },
    [onToastOpen, onClose],
  );

  const [state, formAction, pending] = useActionState(handleAction, {
    success: null,
    defaultValue: '',
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Dialog.Root>
        <Dialog.Header onClose={onClose} title="お問い合わせ" />
        <Dialog.Content>
          <form action={formAction} className="flex flex-col gap-4">
            <FormControl
              errorText={state.success === false ? state.message : undefined}
              helpText="255文字以内で入力してください"
              invalid={state.success === false}
              label="不具合やご要望をご記入ください"
              renderInput={({
                id,
                'aria-describedby': ariaDescribedby,
                disabled,
                invalid,
              }) => (
                <Textarea
                  aria-describedby={ariaDescribedby}
                  defaultValue={state.defaultValue}
                  disabled={disabled}
                  id={id}
                  invalid={invalid}
                  name="message"
                  required
                  rows={5}
                />
              )}
            />
            <p className="self-end text-sm">
              <Anchor href="https://github.com/k35o/k8o/issues/new">
                GitHub&nbsp;Issue
              </Anchor>
              からのお問い合わせもお待ちしております。
            </p>
            <div className="w-full">
              <Button disabled={pending} fullWidth type="submit">
                送信
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Root>
    </Modal>
  );
};
