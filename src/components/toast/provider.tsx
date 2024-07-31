'use client';

import { AnimatePresence, motion, Variants } from 'framer-motion';
import { StatusType } from '@/types';
import {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Toast } from './toast';
import { uuidV4 } from '@/utils/uuid-v4';

type ToastType = {
  id: string;
  status: StatusType;
  message: string;
};

const SetToastContext = createContext<
  Dispatch<SetStateAction<ToastType[]>> | undefined
>(undefined);

export const useToast = () => {
  const setToasts = useContext(SetToastContext);
  if (!setToasts) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const onOpen = useCallback(
    (status: StatusType, message: string) => {
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

export const ToastProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    ref.current = document.body;
  }, []);

  return (
    <SetToastContext.Provider value={setToasts}>
      {children}
      {ref.current
        ? createPortal(
            <div
              role="region"
              aria-live="polite"
              aria-label="通知"
              className="fixed bottom-3 z-50 flex w-full flex-col items-center justify-center gap-2"
            >
              <AnimatePresence initial={false}>
                {toasts.map((toast) => (
                  <motion.div
                    key={toast.id}
                    layout
                    variants={toastMotionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    custom={{ position: 'bottom' }}
                  >
                    <div
                      role="status"
                      aria-atomic={true}
                      className="shadow-lg"
                    >
                      <Toast {...toast} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>,
            ref.current,
          )
        : null}
    </SetToastContext.Provider>
  );
};
