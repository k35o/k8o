import { StatusType } from '@/types';
import {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
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

export const ToastProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);
  return (
    <SetToastContext.Provider value={setToasts}>
      {children}
      {createPortal(
        <div
          role="region"
          aria-live="polite"
          aria-label="通知"
          className="fixed bottom-3 z-50 flex w-full flex-col items-center justify-center gap-2"
        >
          {toasts.map((toast) => (
            <div key={toast.id} role="status" aria-atomic={true}>
              <Toast {...toast} />
            </div>
          ))}
        </div>,
        document.body,
      )}
    </SetToastContext.Provider>
  );
};
