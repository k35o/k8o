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
    <div className="relative h-40 w-full rounded-l-sm bg-bg-emphasize sm:h-auto sm:w-1/3">
      <Image
        alt=""
        className="rounded-l-sm object-contain"
        fill
        onError={() => {
          setIsError(true);
        }}
        src={src}
        unoptimized
      />
    </div>
  );
};
