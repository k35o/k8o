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
          className="text-fg-success size-8"
        />
      )}
      {status === 'info' && (
        <Info aria-label="情報" className="text-fg-info size-8" />
      )}
      {status === 'warning' && (
        <TriangleAlert
          aria-label="警告"
          className="text-fg-warning size-8"
        />
      )}
      {status === 'error' && (
        <CircleAlert
          aria-label="エラー"
          className="text-fg-error size-8"
        />
      )}
    </div>
  );
};
