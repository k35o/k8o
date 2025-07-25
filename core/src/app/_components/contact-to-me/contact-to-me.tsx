'use client';

import { contact } from '@/app/_api/contact-to-me';
import { Anchor } from '@k8o/arte-odyssey/anchor';
import { Button } from '@k8o/arte-odyssey/button';
import { Dialog } from '@k8o/arte-odyssey/dialog';
import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { Textarea } from '@k8o/arte-odyssey/form/textarea';
import { SendIcon } from '@k8o/arte-odyssey/icons';
import { Modal } from '@k8o/arte-odyssey/modal';
import { useToast } from '@k8o/arte-odyssey/toast';
import {
  FC,
  useActionState,
  useCallback,
  useEffect,
  useState,
} from 'react';

export const ContactToMe: FC<{
  fullWidth?: boolean;
}> = ({ fullWidth = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      {isOpen ? (
        <p className="text-md text-fg-info flex items-center gap-2 px-4 py-2 text-center font-bold">
          <SendIcon />
          お問い合わせ
        </p>
      ) : (
        <Button
          onClick={onOpen}
          startIcon={<SendIcon />}
          variant="skeleton"
          fullWidth={fullWidth}
        >
          お問い合わせ
        </Button>
      )}
      <ContactToMeModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};

const ContactToMeModal: FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [state, formAction, pending] = useActionState(contact, {
    success: null,
    defaultValue: '',
  });
  const { onOpen: onToastOpen } = useToast();

  // TODO: useEffectを用いない方法で実装する
  useEffect(() => {
    if (state.success) {
      onToastOpen('success', 'お問い合わせの送信に成功しました');
      onClose();
    }
  }, [onClose, onToastOpen, state.success]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Dialog.Root>
        <Dialog.Header title="お問い合わせ" onClose={onClose} />
        <Dialog.Content>
          <form className="flex flex-col gap-4" action={formAction}>
            <FormControl
              label="不具合やご要望をご記入ください"
              isInvalid={state.success === false}
              errorText={
                state.success === false ? state.message : undefined
              }
              helpText="255文字以内で入力してください"
              renderInput={({
                id,
                describedbyId,
                isDisabled,
                isInvalid,
              }) => (
                <Textarea
                  id={id}
                  name="message"
                  defaultValue={state.defaultValue}
                  describedbyId={describedbyId}
                  isDisabled={isDisabled}
                  isInvalid={isInvalid}
                  isRequired={true}
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
              <Button type="submit" fullWidth disabled={pending}>
                送信
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Root>
    </Modal>
  );
};
