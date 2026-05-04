import type { FC } from 'react';

export const ColorTip: FC<{ color: string; hex: string }> = ({
  color,
  hex,
}) => (
  <div
    className="bg-bg-mute flex h-36 w-full items-center justify-center rounded-xl transition-colors duration-200"
    style={{ backgroundColor: color }}
  >
    <p
      className="text-2xl font-bold tracking-wider select-all"
      style={{ color: `contrast-color(${color})` }}
    >
      #{hex}
    </p>
  </div>
);
