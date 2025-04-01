import { Dialog } from '../dialog';
import {
  ComponentRef,
  PropsWithChildren,
  useEffect,
  useRef,
} from 'react';

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

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/pull/940待ち
    <dialog
      ref={dialogRef}
      className="max-h-lg bg-bg-base border-border-mute backdrop:bg-back-drop m-auto w-5/6 max-w-2xl rounded-lg shadow-xl dark:border"
      onClose={onDismiss}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          dialogRef.current?.close();
        }
      }}
      onKeyDown={(e) =>
        e.key === 'Escape' && dialogRef.current?.close()
      }
    >
      <Dialog.Root>
        <Dialog.Header title={title} onClose={onDismiss} />
        <Dialog.Content>{children}</Dialog.Content>
      </Dialog.Root>
    </dialog>
  );
}
