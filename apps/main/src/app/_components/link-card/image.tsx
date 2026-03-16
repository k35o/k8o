'use client';

import { cn } from '@repo/helpers/cn';
import Image from 'next/image';
import { type FC, useState } from 'react';

type Variant = 'horizontal' | 'vertical';

export const MetaImage: FC<{
  src: string;
  variant: Variant;
}> = ({ src, variant }) => {
  const [isError, setIsError] = useState(false);
  if (isError) {
    return null;
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        variant === 'vertical'
          ? 'h-48 w-full rounded-t-sm'
          : 'h-40 w-full rounded-t-sm sm:h-auto sm:w-1/3 sm:rounded-t-none sm:rounded-l-sm',
      )}
    >
      <Image
        alt=""
        className={cn(
          variant === 'vertical'
            ? 'rounded-t-sm object-cover'
            : 'rounded-l-sm object-contain',
        )}
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
