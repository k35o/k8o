import { Heading } from '@k8o/arte-odyssey';
import type { FC, ReactNode } from 'react';

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export const PageHeader: FC<Props> = ({ title, description, action }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div className="flex flex-col gap-2">
      <Heading type="h1">{title}</Heading>
      {description !== undefined && (
        <p className="text-fg-mute text-sm leading-relaxed">{description}</p>
      )}
    </div>
    {action !== undefined && <div className="shrink-0">{action}</div>}
  </div>
);
