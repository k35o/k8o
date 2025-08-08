'use client';

import { Dialog } from '@k8o/arte-odyssey/dialog';
import { Modal } from '@k8o/arte-odyssey/modal';
import { useRouter } from 'next/navigation';
import type { PropsWithChildren } from 'react';

export function NewsModal({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  const router = useRouter();

  return (
    <Modal
      defaultOpen={true}
      onClose={() => {
        router.back();
      }}
    >
      <Dialog.Root>
        <Dialog.Header
          onClose={() => {
            router.back();
          }}
          title={title}
        />
        <Dialog.Content>{children}</Dialog.Content>
      </Dialog.Root>
    </Modal>
  );
}
