'use client';

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
      title={title}
      onClose={() => {
        router.back();
      }}
    >
      {children}
    </Modal>
  );
}
