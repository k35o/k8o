import { FC } from 'react';
import type { StatusType } from '@/types';
import { AlertIcon } from '../alert-icon';
import { cn } from '@/utils/cn';

type Props = {
  status: StatusType;
  message: string | string[];
};

export const Alert: FC<Props> = ({ status, message }) => {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-2 rounded-lg p-4',
        status === 'success' && 'bg-bg-success',
        status === 'info' && 'bg-bg-info',
        status === 'warning' && 'bg-bg-warning',
        status === 'error' && 'bg-bg-error',
      )}
    >
      <AlertIcon status={status} />
      {Array.isArray(message) ? (
        message.length > 1 ? (
          <ul className="ml-4 list-disc">
            {message.map((msg) => (
              <li key={msg} className="dark:text-fg-inverse text-lg">
                {msg}
              </li>
            ))}
          </ul>
        ) : (
          <p className="dark:text-fg-inverse text-lg">{message[0]}</p>
        )
      ) : (
        <p className="dark:text-fg-inverse text-lg font-bold">
          {message}
        </p>
      )}
    </div>
  );
};
