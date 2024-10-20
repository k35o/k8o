import { FC } from 'react';

export const ColorTip: FC<{ color: string }> = ({ color }) => {
  return (
    <div
      className="size-48 rounded-lg border border-borderPrimary"
      style={{ backgroundColor: color }}
    />
  );
};
