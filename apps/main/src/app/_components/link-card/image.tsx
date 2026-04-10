'use client';

import Image from 'next/image';
import { type FC, useState } from 'react';

export const MetaImage: FC<{
  src: string;
}> = ({ src }) => {
  const [isError, setIsError] = useState(false);
  if (isError) {
    return null;
  }

  return (
    <div className="flex w-full flex-col justify-center overflow-hidden rounded-t-xl bg-bg-subtle sm:w-48 sm:shrink-0 sm:rounded-t-none sm:rounded-l-xl">
      <div className="relative aspect-video w-full">
        <Image
          alt=""
          className="object-contain object-center"
          fill
          onError={() => {
            setIsError(true);
          }}
          src={src}
          unoptimized
        />
      </div>
    </div>
  );
};
