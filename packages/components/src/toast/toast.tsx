import { Alert } from '../alert';
import { useToast } from './provider';
import { Status } from '@k8o/helpers';
import { useTimeout } from '@k8o/hooks/timeout';
import { FC, useCallback } from 'react';

type ToastProps = {
  id: string;
  status: Status;
  message: string;
};

const DELAY_MS = 5000;

export const Toast: FC<ToastProps> = ({ id, status, message }) => {
  const { onClose } = useToast();

  useTimeout(
    useCallback(() => {
      onClose(id);
    }, [id, onClose]),
    DELAY_MS,
  );

  return <Alert status={status} message={message} />;
};
