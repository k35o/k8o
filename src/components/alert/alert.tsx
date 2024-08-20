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
        status === 'success' && 'bg-bgSuccess',
        status === 'info' && 'bg-bgInfo',
        status === 'warning' && 'bg-bgWarning',
        status === 'error' && 'bg-bgError',
      )}
    >
      <AlertIcon status={status} />
      {Array.isArray(message) ? (
        message.length > 1 ? (
          <ul className="ml-4 list-disc">
            {message.map((msg) => (
              <li key={msg} className="text-lg dark:text-textOnFill">
                {msg}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-lg dark:text-textOnFill">{message[0]}</p>
        )
      ) : (
        <p className="text-lg font-bold dark:text-textOnFill">
          {message}
        </p>
      )}
    </div>
  );
};
