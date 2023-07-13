import { FC } from 'react';

export const ColorTip: FC<{ color: string }> = ({ color }) => {
  console.log(color);
  return (
    <div
      className="h-6 w-6 rounded-md border border-slate-800"
      style={{ backgroundColor: color }}
    />
  );
};
