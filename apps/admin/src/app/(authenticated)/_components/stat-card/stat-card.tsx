import { Card } from '@k8o/arte-odyssey';
import type { FC, ReactNode } from 'react';

type Props = {
  label: string;
  value: string;
  description?: string;
  icon?: ReactNode;
};

/**
 * ダッシュボード等で使う統計カード。
 * アイコンは右上に Teal のチップで添え、数値は等幅で揃える。
 */
export const StatCard: FC<Props> = ({ label, value, description, icon }) => (
  <Card appearance="shadow">
    <div className="flex items-start justify-between gap-3 p-6">
      <div className="flex flex-col gap-2">
        <p className="text-fg-mute text-sm">{label}</p>
        <p className="text-3xl leading-tight font-bold tabular-nums">{value}</p>
        {description !== undefined && (
          <p className="text-fg-mute text-xs">{description}</p>
        )}
      </div>
      {icon !== undefined && (
        <span className="bg-primary-bg-subtle text-primary-fg rounded-lg p-2">
          {icon}
        </span>
      )}
    </div>
  </Card>
);
