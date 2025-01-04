'use client';

import { Modal } from '@/components/modal';
import { IconButton } from '@/components/icon-button';
import { FC, useActionState, useCallback, useState } from 'react';
import { Send } from 'lucide-react';
import { Textarea } from '@/components/form/textarea';
import { FormControl } from '@/components/form/form-control';
import { Button } from '@/components/button';
import { contact } from '@/app/_actions/contact-to-me';

export const ContactToMe: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState(contact, {
    success: true,
    defaultValue: '',
  });

  const onOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <IconButton onClick={onOpen}>
        <span className="sr-only">お問い合わせ</span>
        <Send className="size-8" />
      </IconButton>
      {isOpen && (
        <Modal title="お問い合わせ" onClose={onClose}>
          <form className="flex flex-col gap-4" action={formAction}>
            <FormControl
              label="お問い合わせ内容"
              isInvalid={!state.success}
              errorText={state.success ? '' : state.message}
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
            <div className="w-full">
              <Button type="submit" fullWidth disabled={pending}>
                送信
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};
