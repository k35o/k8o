'use client';

import {
  type ElementRef,
  type FC,
  type PropsWithChildren,
  useEffect,
  useRef,
} from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { IconButton } from '@/components/icon-button';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { Heading } from '@/components/heading';

export const Modal: FC<PropsWithChildren<{ title: string }>> = ({
  children,
  title,
}) => {
  const router = useRouter();
  const dialogRef = useRef<ElementRef<'dialog'>>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog?.open) {
      dialog?.showModal();
    }
  }, []);

  function onDismiss() {
    router.back();
  }

  return createPortal(
    <div className="absolute bottom-0 left-0 right-0 top-0 z-50 bg-bgBackDrop">
      <dialog
        ref={dialogRef}
        className="max-h-lg w-10/12 max-w-lg rounded-xl bg-white shadow-xl"
        onClose={onDismiss}
      >
        <div className="flex flex-col items-center justify-center gap-3 p-6">
          <Heading type="h2">{title}</Heading>
          {children}
        </div>
        <div className="absolute right-2 top-2">
          <IconButton onClick={onDismiss}>
            <XMarkIcon title="閉じる" className="size-4" />
          </IconButton>
        </div>
      </dialog>
    </div>,
    document.body,
  );
};
