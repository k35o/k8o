'use client';

import { Anchor } from '@k8o/arte-odyssey/anchor';
import { Button } from '@k8o/arte-odyssey/button';
import { Dialog } from '@k8o/arte-odyssey/dialog';
import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { Textarea } from '@k8o/arte-odyssey/form/textarea';
import { SendIcon } from '@k8o/arte-odyssey/icons';
import { Modal } from '@k8o/arte-odyssey/modal';
import { useToast } from '@k8o/arte-odyssey/toast';
import {
  type FC,
  useActionState,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { contact } from '@/app/_api/contact-to-me';

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
        <p className="flex items-center gap-2 px-4 py-2 text-center font-bold text-fg-info text-md">
          <SendIcon />
          お問い合わせ
        </p>
      ) : (
        <Button
          fullWidth={fullWidth}
          onClick={onOpen}
          startIcon={<SendIcon />}
          variant="skeleton"
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
        <Dialog.Header onClose={onClose} title="お問い合わせ" />
        <Dialog.Content>
          <form action={formAction} className="flex flex-col gap-4">
            <FormControl
              errorText={state.success === false ? state.message : undefined}
              helpText="255文字以内で入力してください"
              isInvalid={state.success === false}
              label="不具合やご要望をご記入ください"
              renderInput={({ id, describedbyId, isDisabled, isInvalid }) => (
                <Textarea
                  defaultValue={state.defaultValue}
                  describedbyId={describedbyId}
                  id={id}
                  isDisabled={isDisabled}
                  isInvalid={isInvalid}
                  isRequired={true}
                  name="message"
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
