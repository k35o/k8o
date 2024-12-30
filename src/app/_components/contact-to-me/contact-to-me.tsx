'use client';

import { Modal } from '@/components/modal';
import { IconButton } from '@/components/icon-button';
import { FC, useCallback, useState } from 'react';
import { Send } from 'lucide-react';
import { Textarea } from '@/components/form/textarea';
import { FormControl } from '@/components/form/form-control';
import { Button } from '@/components/button';

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
      <IconButton onClick={onOpen}>
        <span className="sr-only">お問い合わせ</span>
        <Send className="size-8" />
      </IconButton>
      {isOpen && (
        <Modal title="お問い合わせ" onClose={onClose}>
          <form className="flex flex-col gap-4">
            <FormControl
              label="お問い合わせ内容"
              renderInput={({
                id,
                describedbyId,
                isDisabled,
                isInvalid,
                isRequired,
              }) => (
                <Textarea
                  id={id}
                  describedbyId={describedbyId}
                  isDisabled={isDisabled}
                  isInvalid={isInvalid}
                  isRequired={isRequired}
                  rows={5}
                />
              )}
            />
            <div className="w-full">
              <Button type="submit" fullWidth>
                送信
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};
