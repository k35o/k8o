import type { Status } from '@k8o/helpers';
import { cn } from '@k8o/helpers/cn';
import type { FC } from 'react';
import { AlertIcon } from '../icons';

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
      className={cn(
        'flex items-center gap-2 rounded-md p-4',
        status === 'success' && 'bg-bg-success',
        status === 'info' && 'bg-bg-info',
        status === 'warning' && 'bg-bg-warning',
        status === 'error' && 'bg-bg-error',
      )}
      role={status === 'error' || status === 'warning' ? 'alert' : 'status'}
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
        <AlertIcon size="lg" status={status} />
        <span className="sr-only">{STATUS_LABEL[status]}</span>
      </span>
      {Array.isArray(message) ? (
        message.length > 1 ? (
          <ul className="ml-4 list-disc">
            {message.map((msg) => (
              <li className="text-lg" key={msg}>
                {msg}
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-bold text-lg">{message[0]}</p>
        )
      ) : (
        <p className="font-bold text-lg">{message}</p>
      )}
    </div>
  );
};
