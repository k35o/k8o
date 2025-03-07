import { AlertIcon } from '../alert-icon';
import type { StatusType } from '@/types';
import { cn } from '@/utils/cn';
import { FC } from 'react';

type Props = {
  status: StatusType;
  message: string | string[];
};

export const Alert: FC<Props> = ({ status, message }) => {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-2 rounded-md p-4',
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
              <li key={msg} className="text-lg">
                {msg}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-lg">{message[0]}</p>
        )
      ) : (
        <p className="text-lg font-bold">{message}</p>
      )}
    </div>
  );
};
