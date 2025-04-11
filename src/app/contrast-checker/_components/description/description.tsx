import { Anchor } from '@/components/anchor';
import { FC } from 'react';

export const Description: FC = () => {
  return (
    <div className="border-border-emphasize w-full rounded-md border-2 p-4">
      <div className="flex flex-col gap-3">
        <p className="text-xl font-bold">
          <Anchor href="https://www.w3.org/TR/WCAG22/">
            WCAG 2.2
          </Anchor>
          によるコントラスト比の基準
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <p className="text-lg font-bold">AA基準</p>
            <p>
              文字のコントラスト比が最低でも4.5:1、大文字の場合は3:1
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-lg font-bold">AAA基準</p>
            <p>
              文字のコントラスト比が最低でも7:1、大文字の場合は4.5:1
            </p>
          </div>
          <p className="text-fg-mute self-end text-sm">
            大文字とは18pt（24px）以上、太字の場合は14pt（18.66px）以上を指します。
          </p>
        </div>
      </div>
    </div>
  );
};
