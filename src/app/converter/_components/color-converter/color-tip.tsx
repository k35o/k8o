import { FC } from 'react';

export const ColorTip: FC<{ color: string }> = ({ color }) => {
  console.log(color);
  return (
    <div
      className="border-border h-6 w-6 rounded-md border"
      style={{ backgroundColor: color }}
    />
  );
};
