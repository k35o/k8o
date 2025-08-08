import { cn } from '@k8o/helpers/cn';
import type { FC, PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
  id?: string;
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  lineClamp?: number;
}>;

export const Heading: FC<Props> = ({ children, id, type, lineClamp }) => {
  if (type === 'h1') {
    return (
      <h1
        className={cn('font-bold text-2xl md:text-3xl', {
          [`line-clamp-${lineClamp?.toString() ?? ''}`]: lineClamp,
        })}
        id={id}
      >
        {children}
      </h1>
    );
  }
  if (type === 'h2') {
    return (
      <h2
        className={cn('font-bold text-xl md:text-2xl', {
          [`line-clamp-${lineClamp?.toString() ?? ''}`]: lineClamp,
        })}
        id={id}
      >
        {children}
      </h2>
    );
  }
  if (type === 'h3') {
    return (
      <h3
        className={cn('font-bold text-lg md:text-xl', {
          [`line-clamp-${lineClamp?.toString() ?? ''}`]: lineClamp,
        })}
        id={id}
      >
        {children}
      </h3>
    );
  }
  if (type === 'h4') {
    return (
      <h4
        className={cn('font-bold text-md md:text-lg', {
          [`line-clamp-${lineClamp?.toString() ?? ''}`]: lineClamp,
        })}
        id={id}
      >
        {children}
      </h4>
    );
  }
  if (type === 'h5') {
    return (
      <h5
        className={cn('font-bold text-sm md:text-md', {
          [`line-clamp-${lineClamp?.toString() ?? ''}`]: lineClamp,
        })}
        id={id}
      >
        {children}
      </h5>
    );
  }
  return (
    <h6
      className={cn('font-bold text-xs md:text-sm', {
        [`line-clamp-${lineClamp?.toString() ?? ''}`]: lineClamp,
      })}
      id={id}
    >
      {children}
    </h6>
  );
};
