import { FC } from 'react';
import type { StatusType } from '@/types';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/solid';
import clsx from 'clsx';

type Props = {
  status: StatusType;
  message: string | string[];
};

export const Alert: FC<Props> = ({ status, message }) => {
  return (
    <div
      role="alert"
      className={clsx(
        'flex items-center gap-2 rounded-md p-4',
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

const AlertIcon: FC<{ status: StatusType }> = ({ status }) => {
  return (
    <div className="h-8 w-8">
      {status === 'success' && (
        <CheckCircleIcon
          aria-label="成功"
          className="h-8 w-8 text-success"
        />
      )}
      {status === 'info' && (
        <InformationCircleIcon
          aria-label="情報"
          className="h-8 w-8 text-info"
        />
      )}
      {status === 'warning' && (
        <ExclamationTriangleIcon
          aria-label="警告"
          className="h-8 w-8 text-warning"
        />
      )}
      {status === 'error' && (
        <ExclamationCircleIcon
          aria-label="エラー"
          className="h-8 w-8 text-error"
        />
      )}
    </div>
  );
};
