import { FC } from 'react';
import type { StatusType } from '@/types';
import clsx from 'clsx';
import { AlertIcon } from '../alert-icon';

type Props = {
  status: StatusType;
  message: string | string[];
};

export const Alert: FC<Props> = ({ status, message }) => {
  return (
    <div
      role="alert"
      className={clsx(
        'flex items-center gap-2 rounded-lg p-4',
        status === 'success' && 'bg-successLight',
        status === 'info' && 'bg-infoLight',
        status === 'warning' && 'bg-warningLight',
        status === 'error' && 'bg-errorLight',
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
