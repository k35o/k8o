import { Dialog } from '../dialog';
import {
  ComponentRef,
  PropsWithChildren,
  useEffect,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';

export function Modal({
  title,
  children,
  onClose,
}: PropsWithChildren<{ title: string; onClose: () => void }>) {
  const dialogRef = useRef<ComponentRef<'dialog'>>(null);

  useEffect(() => {
    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
  }, []);

  function onDismiss() {
    onClose();
  }

  return createPortal(
    <div className="bg-back-drop absolute top-0 right-0 bottom-0 left-0 z-50">
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/pull/940待ち */}
      <dialog
        ref={dialogRef}
        className="max-h-lg bg-bg-base m-auto w-5/6 max-w-2xl rounded-lg shadow-xl"
        onClose={onDismiss}
        onClick={() => dialogRef.current?.close()}
        onKeyDown={(e) =>
          e.key === 'Escape' && dialogRef.current?.close()
        }
      >
        <Dialog.Root>
          <Dialog.Header title={title} onClose={onDismiss} />
          <Dialog.Content>{children}</Dialog.Content>
        </Dialog.Root>
      </dialog>
    </div>,
    document.body,
  );
}
