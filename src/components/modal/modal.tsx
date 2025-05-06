import { ToastProvider } from '../toast';
import { cn } from '@/utils/cn';
import { Variants } from 'motion/react';
import * as motion from 'motion/react-client';
import {
  FC,
  PropsWithChildren,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

const centerVariants: Variants = {
  open: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  closed: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const bottomVariants: Variants = {
  open: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  closed: {
    opacity: 0,
    y: '100%',
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};
const rightVariants: Variants = {
  open: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  closed: {
    opacity: 0,
    x: '100%',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const Modal: FC<
  PropsWithChildren<{
    // TODO: 外部のref.current.showModal()にrealDialogOpenが追従するようにする
    ref?: RefObject<HTMLDialogElement | null>;
    type?: 'center' | 'bottom' | 'right';
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
    <motion.dialog
      ref={realRef}
      animate={realDialogOpen ? 'open' : 'closed'}
      initial="closed"
      exit="closed"
      variants={
        type === 'center'
          ? centerVariants
          : type === 'bottom'
            ? bottomVariants
            : rightVariants
      }
      className={cn(
        'bg-bg-base border-border-mute backdrop:bg-back-drop shadow-xl',
        type === 'center' &&
          'max-h-lg m-auto w-5/6 max-w-2xl rounded-lg dark:border',
        type === 'bottom' &&
          'mt-auto w-screen max-w-screen rounded-t-lg dark:border-t',
        type === 'right' &&
          'ml-auto min-h-screen w-screen max-w-sm rounded-l-lg dark:border-l',
      )}
      onClose={realOnClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          realRef.current?.close();
        }
      }}
    >
      <ToastProvider portalRef={realRef} position="absolute">
        {children}
      </ToastProvider>
    </motion.dialog>
  );
};
