import type { FC, ReactNode } from 'react';

type Props = {
  message: string;
  icon?: ReactNode;
};

export const EmptyState: FC<Props> = ({ message, icon }) => (
  <div className="border-border-mute flex flex-col items-center gap-3 rounded-2xl border border-dashed py-12 text-center">
    {icon !== undefined && <span className="text-fg-mute">{icon}</span>}
    <p className="text-fg-mute text-sm">{message}</p>
  </div>
);
