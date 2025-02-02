import { FC } from 'react';

export const ColorTip: FC<{ color: string }> = ({ color }) => {
  return (
    <div
      className="border-border-base size-48 rounded-lg border"
      style={{ backgroundColor: color }}
    />
  );
};
