import { AlertIcon } from '../icons';
import type { Status } from '@k8o/helpers';
import { cn } from '@k8o/helpers/cn';
import { FC } from 'react';

type Props = {
  status: Status;
  message: string | string[];
};

const STATUS_LABEL = {
  success: '成功',
  info: '情報',
  warning: '警告',
  error: 'エラー',
} as const;

export const Alert: FC<Props> = ({ status, message }) => {
  return (
    <div
      role={
        status === 'error' || status === 'warning'
          ? 'alert'
          : 'status'
      }
      className={cn(
        'flex items-center gap-2 rounded-md p-4',
        status === 'success' && 'bg-bg-success',
        status === 'info' && 'bg-bg-info',
        status === 'warning' && 'bg-bg-warning',
        status === 'error' && 'bg-bg-error',
      )}
    >
      <span
        className={cn(
          'size-8',
          status === 'success' && 'text-fg-success',
          status === 'info' && 'text-fg-info',
          status === 'warning' && 'text-fg-warning',
          status === 'error' && 'text-fg-error',
        )}
      >
        <AlertIcon status={status} size="lg" />
        <span className="sr-only">{STATUS_LABEL[status]}</span>
      </span>
      {Array.isArray(message) ? (
        message.length > 1 ? (
          <ul className="ml-4 list-disc">
            {message.map((msg) => (
              <li key={msg} className="text-lg">
                {msg}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-lg font-bold">{message[0]}</p>
        )
      ) : (
        <p className="text-lg font-bold">{message}</p>
      )}
    </div>
  );
};
