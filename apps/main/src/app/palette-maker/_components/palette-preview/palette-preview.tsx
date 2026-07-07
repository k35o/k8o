import type { FC } from 'react';

import type { PaletteSwatch } from '../../_types/palette';

type Props = {
  swatches: readonly PaletteSwatch[];
};

const readableTextColor = (swatch: PaletteSwatch): string =>
  swatch.readableText === 'white' ? '#ffffff' : '#000000';

const readableContrast = (swatch: PaletteSwatch): number =>
  swatch.readableText === 'white' ? swatch.contrastWhite : swatch.contrastBlack;

export const PalettePreview: FC<Props> = ({ swatches }) => {
  const hasClamped = swatches.some((swatch) => swatch.isClamped);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-11">
        {swatches.map((swatch) => (
          <div className="flex flex-col gap-1" key={swatch.step}>
            <div
              className="flex h-12 items-center justify-between rounded-md px-2 sm:h-20 sm:flex-col sm:items-start sm:py-1.5"
              style={{ backgroundColor: swatch.hex }}
            >
              <span
                className="text-xs font-bold"
                style={{ color: readableTextColor(swatch) }}
              >
                {swatch.step}
              </span>
              <span
                className="text-xs"
                style={{ color: readableTextColor(swatch) }}
              >
                {readableContrast(swatch).toFixed(2)}
              </span>
            </div>
            <p className="text-fg-mute font-mono text-xs">
              {swatch.hex}
              {swatch.isClamped ? '＊' : ''}
            </p>
          </div>
        ))}
      </div>
      {/* 表示/非表示でレイアウトが動かないよう、行の高さは常に確保する */}
      <p className={`text-fg-mute text-xs ${hasClamped ? '' : 'invisible'}`}>
        ＊はsRGB色域に収めるため彩度を自動調整した段です
      </p>
    </div>
  );
};
