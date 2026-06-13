import { formatHex } from '@repo/helpers/color/format';
import type { Color } from '@repo/helpers/color/spaces';
import type { FC } from 'react';

// 透明度を可視化するチェッカーボード。
const CHECKERBOARD = {
  backgroundImage:
    'repeating-conic-gradient(rgb(128 128 128 / 0.25) 0% 25%, transparent 0% 50%)',
  backgroundSize: '20px 20px',
} as const;

export const ColorTip: FC<{ color: Color }> = ({ color }) => {
  const css = formatHex(color);
  // テキストのコントラストは不透明な色を基準にする。
  const opaque = formatHex({ ...color, alpha: 1 });

  return (
    <div className="relative h-36 w-full overflow-hidden rounded-xl">
      <div className="absolute inset-0" style={CHECKERBOARD} />
      <div
        className="absolute inset-0 flex items-center justify-center transition-colors duration-200"
        style={{ backgroundColor: css }}
      >
        <p
          className="font-mono text-2xl font-bold tracking-wider select-all"
          style={{ color: `contrast-color(${opaque})` }}
        >
          {css}
        </p>
      </div>
    </div>
  );
};
