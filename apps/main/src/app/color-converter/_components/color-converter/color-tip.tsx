import type { FC } from 'react';

export const ColorTip: FC<{ color: string }> = ({ color }) => {
  return (
    <div
      className="size-48 rounded-md border border-border-base"
      style={{ backgroundColor: color }}
    />
  );
};
