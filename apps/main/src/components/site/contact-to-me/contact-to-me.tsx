'use client';

import { useForm } from '@k8ordo/form';
import type { FormState } from '@k8ordo/form';
import {
  Anchor,
  Button,
  Dialog,
  FormControl,
  IconButton,
  Modal,
  Textarea,
  useToast,
} from '@k8ordo/ui';
import { SendIcon } from '@k8ordo/ui/icons';
import { useActionState, useCallback, useState } from 'react';
import type { FC } from 'react';

import { publicApi } from '@/shared/api/public-api';

import type { ContactFields } from './contact-fields';

import styles from './contact-to-me.module.css';

const FAILED_MESSAGE =
  'お問い合わせの送信に失敗しました。しばらくしてから再度お試しください。';

export const ContactToMe: FC<{ fields: ContactFields }> = ({ fields }) => {
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
      <ContactToMeModal fields={fields} isOpen={isOpen} onClose={onClose} />
    </>
  );
};

const ContactToMeModal: FC<{
  fields: ContactFields;
  isOpen: boolean;
  onClose: () => void;
}> = ({ fields, isOpen, onClose }) => {
  const { open: onToastOpen } = useToast();

  // static mode には Server Action が無いので、送信はブラウザから api を呼ぶ。入力の検証は useForm が
  // 送信の前に済ませ、ここに届くのは通った値だけ。送れなかったときは、打った本文を values で返して残す
  const handleAction = useCallback(
    async (_prevState: FormState, formData: FormData): Promise<FormState> => {
      const value = formData.get('message');
      const message = typeof value === 'string' ? value : '';
      try {
        const res = await publicApi.public.inquiries.$post({
          json: { message },
        });
        if (res.ok) {
          onToastOpen('success', 'お問い合わせの送信に成功しました');
          onClose();
          return {};
        }
      } catch {
        // 下で失敗の文言を返す
      }
      return {
        errors: { message: FAILED_MESSAGE },
        values: { message },
        token: crypto.randomUUID(),
      };
    },
    [onToastOpen, onClose],
  );

  const [state, formAction, pending] = useActionState(handleAction, {});
  const form = useForm(fields, state);
  const message = form.field('message');

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Dialog.Root>
        <Dialog.Header onClose={onClose} title="お問い合わせ" />
        <Dialog.Content>
          <form {...form.props} action={formAction} className={styles.form}>
            <FormControl
              errorText={message.error}
              helpText="255文字以内で入力してください"
              invalid={message.invalid}
              label="不具合やご要望をご記入ください"
              renderInput={(props) => (
                <Textarea {...props} {...message.input} rows={5} />
              )}
            />
            <p className={styles.issueNote}>
              <Anchor href="https://github.com/k35o/k8o/issues/new">
                GitHub&nbsp;Issue
              </Anchor>
              からのお問い合わせもお待ちしております。
            </p>
            <div className={styles.submit}>
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
