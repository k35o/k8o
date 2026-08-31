import { Heading } from '@k8ordo/ui';
import type { FC, ReactNode } from 'react';

type Props = {
  title: string;
  action?: ReactNode;
};

export const SectionHeader: FC<Props> = ({ title, action }) => (
  <div className="flex items-center justify-between gap-4">
    <Heading level="h2">{title}</Heading>
    {action !== undefined && <div className="shrink-0">{action}</div>}
  </div>
);
