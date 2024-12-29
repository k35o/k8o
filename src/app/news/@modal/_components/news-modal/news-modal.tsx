'use client';

import { PropsWithChildren } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/modal';

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
