import { FC } from 'react';

export const ColorTip: FC<{ color: string }> = ({ color }) => {
  return (
    <div
      className="size-6 rounded-lg border border-borderPrimary"
      style={{ backgroundColor: color }}
    />
  );
};
