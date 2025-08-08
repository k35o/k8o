'use client';

import type { Status } from '@k8o/helpers';
import { cn } from '@k8o/helpers/cn';
import { uuidV4 } from '@k8o/helpers/uuid-v4';
import { AnimatePresence, type Variants } from 'motion/react';
import * as motion from 'motion/react-client';
import {
  createContext,
  type Dispatch,
  type FC,
  type PropsWithChildren,
  type RefObject,
  type SetStateAction,
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Toast } from './toast';

type ToastType = {
  id: string;
  status: Status;
  message: string;
};

const SetToastContext = createContext<
  Dispatch<SetStateAction<ToastType[]>> | undefined
>(undefined);

export const useToast = () => {
  const setToasts = use(SetToastContext);
  if (!setToasts) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const onOpen = useCallback(
    (status: Status, message: string) => {
      setToasts((prev) => [
        ...prev,
        {
          id: uuidV4(),
          status,
          message,
        },
      ]);
    },
    [setToasts],
  );

  const onClose = useCallback(
    (id: string) => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    },
    [setToasts],
  );

  const onCloseAll = useCallback(() => {
    setToasts([]);
  }, [setToasts]);

  return {
    onOpen,
    onClose,
    onCloseAll,
  };
};

const toastMotionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 24,
  },
  animate: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.85,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

export const ToastProvider: FC<
  PropsWithChildren<{
    portalRef?: RefObject<HTMLElement | null>;
    position?: 'fixed' | 'absolute';
  }>
> = ({ children, portalRef = null, position = 'fixed' }) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    ref.current = document.body;
  }, []);

  const container = portalRef?.current ?? ref.current;

  return (
    <SetToastContext value={setToasts}>
      {children}
      {container
        ? createPortal(
            <section
              aria-label="通知"
              aria-live="polite"
              className={cn(
                'absolute bottom-3 z-50 flex w-full flex-col items-center justify-center gap-4',
                position === 'fixed' && 'fixed',
                position === 'absolute' && 'absolute',
              )}
            >
              <AnimatePresence initial={false}>
                {toasts.map((toast) => (
                  <motion.div
                    animate="animate"
                    custom={{ position: 'bottom' }}
                    exit="exit"
                    initial="initial"
                    key={toast.id}
                    layout
                    variants={toastMotionVariants}
                  >
                    <div
                      aria-atomic={true}
                      className="shadow-lg"
                      role={
                        toast.status === 'error' || toast.status === 'warning'
                          ? 'alert'
                          : 'status'
                      }
                    >
                      <Toast {...toast} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </section>,
            container,
          )
        : null}
    </SetToastContext>
  );
};
