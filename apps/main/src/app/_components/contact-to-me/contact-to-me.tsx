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
} from '@k8ordo/ui';
import { useActionState, useCallback, useState } from 'react';
import type { FC } from 'react';

import { publicApi } from '@/shared/api/public-api';

type ContactState = {
  error: string | null;
  defaultValue: string;
};

const INITIAL_STATE: ContactState = { error: null, defaultValue: '' };

const MAX_MESSAGE_LENGTH = 255;

const FAILED_MESSAGE =
  'お問い合わせの送信に失敗しました。しばらくしてから再度お試しください。';

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
  const { open: onToastOpen } = useToast();

  const handleAction = useCallback(
    async (
      _prevState: ContactState,
      formData: FormData,
    ): Promise<ContactState> => {
      const value = formData.get('message');
      const message = typeof value === 'string' ? value : '';
      if (message.length > MAX_MESSAGE_LENGTH) {
        return {
          error: `${MAX_MESSAGE_LENGTH}文字を超えています（${message.length}文字）`,
          defaultValue: message,
        };
      }
      try {
        const res = await publicApi.public.inquiries.$post({
          json: { message },
        });
        if (res.ok) {
          onToastOpen('success', 'お問い合わせの送信に成功しました');
          onClose();
          return INITIAL_STATE;
        }
        return { error: FAILED_MESSAGE, defaultValue: message };
      } catch {
        return { error: FAILED_MESSAGE, defaultValue: message };
      }
    },
    [onToastOpen, onClose],
  );

  const [state, formAction, pending] = useActionState(
    handleAction,
    INITIAL_STATE,
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Dialog.Root>
        <Dialog.Header onClose={onClose} title="お問い合わせ" />
        <Dialog.Content>
          <form action={formAction} className="flex flex-col gap-4">
            <FormControl
              errorText={state.error ?? undefined}
              helpText="255文字以内で入力してください"
              invalid={state.error !== null}
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
