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
          className="size-8 text-textSuccess"
        />
      )}
      {status === 'info' && (
        <Info aria-label="情報" className="size-8 text-textInfo" />
      )}
      {status === 'warning' && (
        <TriangleAlert
          aria-label="警告"
          className="size-8 text-textWarning"
        />
      )}
      {status === 'error' && (
        <CircleAlert
          aria-label="エラー"
          className="size-8 text-textError"
        />
      )}
    </div>
  );
};
