'use client';

import {
  ComponentRef,
  PropsWithChildren,
  useEffect,
  useRef,
} from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { Heading } from '@/components/heading';
import { IconButton } from '@/components/icon-button';
import { X } from 'lucide-react';

export function Modal({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  const router = useRouter();
  const dialogRef = useRef<ComponentRef<'dialog'>>(null);

  useEffect(() => {
    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
  }, []);

  function onDismiss() {
    router.back();
  }

  return createPortal(
    <div className="absolute bottom-0 left-0 right-0 top-0 z-50 bg-bgBackDrop">
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/pull/940待ち */}
      <dialog
        ref={dialogRef}
        className="max-h-lg w-5/6 max-w-2xl rounded-xl bg-bgBase shadow-xl"
        onClose={onDismiss}
        onClick={() => dialogRef.current?.close()}
        onKeyDown={(e) =>
          e.key === 'Escape' && dialogRef.current?.close()
        }
      >
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- 参考:https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/no-static-element-interactions.md#case-the-event-handler-is-only-being-used-to-capture-bubbled-events */}
        <div
          className="flex flex-col items-center justify-center gap-3 p-6"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Heading type="h2">{title}</Heading>
          {children}
        </div>
        <div className="absolute right-2 top-2">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
          >
            <X aria-label="閉じる" className="size-4" />
          </IconButton>
        </div>
      </dialog>
    </div>,
    document.body,
  );
}
