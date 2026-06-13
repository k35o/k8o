import { Anchor } from '@k8o/arte-odyssey';
import type { FC } from 'react';

export const Description: FC = () => (
  <div className="bg-bg-mute w-full rounded-xl p-4">
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="text-lg font-bold md:text-xl">
          <Anchor href="https://www.w3.org/TR/WCAG22/">WCAG 2.2</Anchor>
          によるコントラスト比の基準
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <p className="text-md font-bold md:text-lg">AA基準</p>
            <p className="md:text-md text-sm">
              文字のコントラスト比が最低でも4.5:1、大文字の場合は3:1
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-md font-bold md:text-lg">AAA基準</p>
            <p className="md:text-md text-sm">
              文字のコントラスト比が最低でも7:1、大文字の場合は4.5:1
            </p>
          </div>
          <p className="text-fg-mute self-end text-xs md:text-sm">
            大文字とは18pt（24px）以上、太字の場合は14pt（18.66px）以上を指します。
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-lg font-bold md:text-xl">
          <Anchor href="https://git.apcacontrast.com/">APCA</Anchor>
          によるコントラストの基準
        </p>
        <div className="flex flex-col gap-2">
          <p className="md:text-md text-sm">
            APCA（Accessible Perceptual Contrast Algorithm）は、WCAG
            3で検討されている人間の知覚に基づくコントラスト指標です。
            コントラストの強さをLc値（0〜±108程度）で表し、正の値は明るい背景に暗い文字、負の値は暗い背景に明るい文字を意味します。
            判定にはLc値の絶対値を使い、本文テキストはLc
            75以上、見出しなど大きなテキストはLc 45以上が目安です。
          </p>
          <p className="text-fg-mute self-end text-xs md:text-sm">
            APCAは策定中の指標のため、基準値は今後変わる可能性があります。
          </p>
        </div>
      </div>
    </div>
  </div>
);
