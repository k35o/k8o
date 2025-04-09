'use client';

import { contact } from '@/app/_services/contact-to-me';
import { Anchor } from '@/components/anchor';
import { Button } from '@/components/button';
import { FormControl } from '@/components/form/form-control';
import { Textarea } from '@/components/form/textarea';
import { SendIcon } from '@/components/icons';
import { Modal } from '@/components/modal';
import { useToast } from '@/components/toast';
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
      {isOpen && <ContactToMeModal onClose={onClose} />}
    </>
  );
};

const ContactToMeModal: FC<{ onClose: () => void }> = ({
  onClose,
}) => {
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
    <Modal title="お問い合わせ" onClose={onClose}>
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
    </Modal>
  );
};
