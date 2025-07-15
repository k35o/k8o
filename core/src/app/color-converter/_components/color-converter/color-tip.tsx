import { FC } from 'react';

export const ColorTip: FC<{ color: string }> = ({ color }) => {
  return (
    <div
      className="border-border-base size-48 rounded-md border"
      style={{ backgroundColor: color }}
    />
  );
};
