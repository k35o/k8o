'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { FC } from 'react';

export const MetaImage: FC<{
  src: string;
}> = ({ src }) => {
  const [isError, setIsError] = useState(false);
  if (isError) {
    return null;
  }

  return (
    <div className="bg-bg-subtle vertical:w-48 vertical:shrink-0 vertical:rounded-s-xl vertical:rounded-e-none flex w-full flex-col justify-center overflow-hidden rounded-t-xl sm:w-48 sm:shrink-0 sm:rounded-s-xl sm:rounded-e-none">
      <div className="relative aspect-video w-full">
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
      </div>
    </div>
  );
};
