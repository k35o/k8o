import type { FC } from 'react';

// 色の明るさを判定してテキストカラーを決定する
const getOverlayColor = (hex: string): string | undefined => {
  const clean = hex.replace('#', '');
  if (clean.length < 6) return;
  const r = Number.parseInt(clean.substring(0, 2), 16);
  const g = Number.parseInt(clean.substring(2, 4), 16);
  const b = Number.parseInt(clean.substring(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

export const ColorTip: FC<{ color: string; hex: string }> = ({
  color,
  hex,
}) => {
  const overlayColor = getOverlayColor(color);

  return (
    <div
      className="flex h-36 w-full items-center justify-center rounded-xl border border-border-base bg-bg-mute transition-colors duration-200"
      style={{ backgroundColor: color }}
    >
      <p
        className="select-all font-bold text-2xl tracking-wider"
        style={overlayColor ? { color: overlayColor } : undefined}
      >
        #{hex}
      </p>
    </div>
  );
};
