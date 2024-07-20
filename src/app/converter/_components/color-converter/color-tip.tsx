import { FC } from 'react';

export const ColorTip: FC<{ color: string }> = ({ color }) => {
  return (
    <div
      className="h-6 w-6 rounded-md border border-border"
      style={{ backgroundColor: color }}
    />
  );
};
