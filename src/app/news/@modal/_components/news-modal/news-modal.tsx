'use client';

import { Dialog } from '@/components/dialog';
import { Modal } from '@/components/modal';
import { useRouter } from 'next/navigation';
import { PropsWithChildren } from 'react';

export function NewsModal({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  const router = useRouter();

  return (
    <Modal
      onClose={() => {
        router.back();
      }}
    >
      <Dialog.Root>
        <Dialog.Header
          title={title}
          onClose={() => {
            router.back();
          }}
        />
        <Dialog.Content>{children}</Dialog.Content>
      </Dialog.Root>
    </Modal>
  );
}
