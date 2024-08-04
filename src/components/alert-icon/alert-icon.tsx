import { FC } from 'react';
import type { StatusType } from '@/types';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/solid';

export const AlertIcon: FC<{ status: StatusType }> = ({ status }) => {
  return (
    <div className="size-8">
      {status === 'success' && (
        <CheckCircleIcon
          aria-label="成功"
          className="size-8 text-success"
        />
      )}
      {status === 'info' && (
        <InformationCircleIcon
          aria-label="情報"
          className="size-8 text-info"
        />
      )}
      {status === 'warning' && (
        <ExclamationTriangleIcon
          aria-label="警告"
          className="size-8 text-warning"
        />
      )}
      {status === 'error' && (
        <ExclamationCircleIcon
          aria-label="エラー"
          className="size-8 text-error"
        />
      )}
    </div>
  );
};
