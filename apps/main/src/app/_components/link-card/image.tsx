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
    <div className="relative aspect-video w-full overflow-hidden rounded-t-lg sm:w-48 sm:shrink-0 sm:rounded-t-none sm:rounded-l-lg">
      <Image
        alt=""
        className="object-cover"
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
