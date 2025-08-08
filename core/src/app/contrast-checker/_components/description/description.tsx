import { Anchor } from '@k8o/arte-odyssey/anchor';
import type { FC } from 'react';

export const Description: FC = () => {
  return (
    <div className="w-full rounded-md border-2 border-border-emphasize p-4">
      <div className="flex flex-col gap-3">
        <p className="font-bold text-lg md:text-xl">
          <Anchor href="https://www.w3.org/TR/WCAG22/">WCAG 2.2</Anchor>
          によるコントラスト比の基準
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <p className="font-bold text-md md:text-lg">AA基準</p>
            <p className="text-sm md:text-md">
              文字のコントラスト比が最低でも4.5:1、大文字の場合は3:1
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-bold text-md md:text-lg">AAA基準</p>
            <p className="text-sm md:text-md">
              文字のコントラスト比が最低でも7:1、大文字の場合は4.5:1
            </p>
          </div>
          <p className="self-end text-fg-mute text-xs md:text-sm">
            大文字とは18pt（24px）以上、太字の場合は14pt（18.66px）以上を指します。
          </p>
        </div>
      </div>
    </div>
  );
};
