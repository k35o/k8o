'use client';

import { PaletteIcon } from '@k8o/arte-odyssey';
import type { CSSProperties, FC } from 'react';

import type { RadiusCorners } from '../../_types/corner-radius';
import type { CornerShape } from '../../_types/corner-shape';
import { toBorderRadiusValue } from '../../_utils/radius-css';

type Props = {
  corners: RadiusCorners;
  shape: CornerShape;
};

// 作った角丸を実際のUIパーツに当てはめて見え方を確認する。
// %指定のborder-radiusは要素の縦横比で見え方が変わるため、固定サイズの実例で示す
export const UiPreview: FC<Props> = ({ corners, shape }) => {
  const radiusStyle: CSSProperties = {
    borderRadius: toBorderRadiusValue(corners),
    cornerShape: shape === 'round' ? undefined : shape,
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-fg-base text-sm font-bold">実際のUIで確認する</p>
      <div className="flex flex-wrap items-end gap-x-8 gap-y-5">
        <figure className="flex flex-col items-center gap-2">
          <div
            aria-hidden="true"
            className="bg-primary-bg text-primary-fg flex size-14 items-center justify-center text-sm font-bold"
            style={radiusStyle}
          >
            k8
          </div>
          <figcaption className="text-fg-mute text-xs">アバター</figcaption>
        </figure>
        <figure className="flex flex-col items-center gap-2">
          <div
            aria-hidden="true"
            className="bg-primary-fg text-bg-base px-5 py-2 text-sm font-bold"
            style={radiusStyle}
          >
            ボタン
          </div>
          <figcaption className="text-fg-mute text-xs">ボタン</figcaption>
        </figure>
        <figure className="flex flex-col items-center gap-2">
          <div
            aria-hidden="true"
            className="border-border-mute bg-bg-base w-40 border p-3 shadow-sm"
            style={radiusStyle}
          >
            <div className="bg-bg-mute mb-2 h-2 w-3/4 rounded-full" />
            <div className="bg-bg-mute mb-1 h-1.5 w-full rounded-full" />
            <div className="bg-bg-mute h-1.5 w-5/6 rounded-full" />
          </div>
          <figcaption className="text-fg-mute text-xs">カード</figcaption>
        </figure>
        <figure className="flex flex-col items-center gap-2">
          <div
            aria-hidden="true"
            className="bg-primary-bg text-primary-fg flex h-24 w-40 items-center justify-center"
            style={radiusStyle}
          >
            <PaletteIcon />
          </div>
          <figcaption className="text-fg-mute text-xs">画像</figcaption>
        </figure>
      </div>
      <p className="text-fg-mute text-xs">
        %指定の角丸は要素の縦横比によって見え方が変わります。
      </p>
    </div>
  );
};
