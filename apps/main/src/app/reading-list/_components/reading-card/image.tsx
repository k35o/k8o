'use client';

import Image from 'next/image';
import { type FC, useState } from 'react';

// 保存済みの OGP 画像 URL を表示する。読み込みに失敗してもコンテナ（画像領域）は
// 残し、レイアウトシフト（CLS）を避ける。失敗時は subtle 背景のプレースホルダになる。
export const ReadingCardImage: FC<{
  src: string;
}> = ({ src }) => {
  const [isError, setIsError] = useState(false);

  return (
    <div className="bg-bg-subtle vertical:w-48 vertical:shrink-0 vertical:rounded-s-xl vertical:rounded-e-none flex w-full flex-col justify-center overflow-hidden rounded-t-xl sm:w-48 sm:shrink-0 sm:rounded-s-xl sm:rounded-e-none">
      <div className="relative aspect-video w-full">
        {!isError && (
          <Image
            alt=""
            className="object-contain object-center"
            fill
            onError={() => {
              setIsError(true);
            }}
            sizes="(min-width: 640px) 192px, 100vw"
            src={src}
            unoptimized
          />
        )}
      </div>
    </div>
  );
};
