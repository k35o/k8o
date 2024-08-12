import { FC } from 'react';
import type { StatusType } from '@/types';
import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
} from 'lucide-react';

export const AlertIcon: FC<{ status: StatusType }> = ({ status }) => {
  return (
    <div className="size-8">
      {status === 'success' && (
        <CircleCheck
          aria-label="成功"
          className="size-8 text-success"
        />
      )}
      {status === 'info' && (
        <Info aria-label="情報" className="size-8 text-info" />
      )}
      {status === 'warning' && (
        <TriangleAlert
          aria-label="警告"
          className="size-8 text-warning"
        />
      )}
      {status === 'error' && (
        <CircleAlert
          aria-label="エラー"
          className="size-8 text-error"
        />
      )}
    </div>
  );
};
