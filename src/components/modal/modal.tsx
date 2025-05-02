import { cn } from '@/utils/cn';
import {
  FC,
  PropsWithChildren,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export const Modal: FC<
  PropsWithChildren<{
    ref?: RefObject<HTMLDialogElement | null>;
    type?: 'center' | 'bottom';
    defaultOpen?: boolean;
    isOpen?: boolean;
    onClose?: () => void;
  }>
> = ({
  ref,
  type = 'center',
  defaultOpen,
  isOpen,
  onClose,
  children,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [dialogOpen, setDialogOpen] = useState(defaultOpen ?? false);

  const realDialogOpen =
    isOpen === true || isOpen === false ? isOpen : dialogOpen;
  const realOnClose = useCallback(() => {
    onClose?.();
    if (isOpen === undefined) {
      return;
    }
    setDialogOpen(false);
  }, [isOpen, onClose]);
  const realRef = ref ?? dialogRef;

  useEffect(() => {
    if (realDialogOpen === realRef.current?.open) {
      return;
    }
    if (realDialogOpen) {
      realRef.current?.showModal();
    } else {
      realRef.current?.close();
    }
  }, [realDialogOpen]);

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events -- https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/pull/940待ち
    <dialog
      ref={realRef}
      className={cn(
        'bg-bg-base border-border-mute backdrop:bg-back-drop shadow-xl',
        type === 'center' &&
          'max-h-lg m-auto w-5/6 max-w-2xl rounded-lg dark:border',
        type === 'bottom' &&
          'mt-auto w-screen max-w-screen rounded-t-lg dark:border-t',
      )}
      onClose={realOnClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          realRef.current?.close();
        }
      }}
    >
      {children}
    </dialog>
  );
};
