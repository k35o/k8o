'use client';

import Image from 'next/image';
import { FC, useState } from 'react';

export const MetaImage: FC<{
  src: string;
}> = ({ src }) => {
  const [isError, setIsError] = useState(false);
  if (isError) {
    return null;
  }

  return (
    <div className="bg-bg-emphasize relative h-40 w-full rounded-l-sm sm:h-auto sm:w-1/3">
      <Image
        src={src}
        alt=""
        fill
        className="rounded-l-sm object-contain"
        unoptimized
        onError={() => {
          setIsError(true);
        }}
      />
    </div>
  );
};
