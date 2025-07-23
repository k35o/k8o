import { cn } from '@k8o/helpers/cn';
import { FC, PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
  id?: string;
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  lineClamp?: number;
}>;

export const Heading: FC<Props> = ({
  children,
  id,
  type,
  lineClamp,
}) => {
  if (type === 'h1') {
    return (
      <h1
        id={id}
        className={cn('text-2xl font-bold md:text-3xl', {
          [`line-clamp-${lineClamp?.toString() ?? ''}`]: lineClamp,
        })}
      >
        {children}
      </h1>
    );
  }
  if (type === 'h2') {
    return (
      <h2
        id={id}
        className={cn('text-xl font-bold md:text-2xl', {
          [`line-clamp-${lineClamp?.toString() ?? ''}`]: lineClamp,
        })}
      >
        {children}
      </h2>
    );
  }
  if (type === 'h3') {
    return (
      <h3
        id={id}
        className={cn('text-lg font-bold md:text-xl', {
          [`line-clamp-${lineClamp?.toString() ?? ''}`]: lineClamp,
        })}
      >
        {children}
      </h3>
    );
  }
  if (type === 'h4') {
    return (
      <h4
        id={id}
        className={cn('text-md font-bold md:text-lg', {
          [`line-clamp-${lineClamp?.toString() ?? ''}`]: lineClamp,
        })}
      >
        {children}
      </h4>
    );
  }
  if (type === 'h5') {
    return (
      <h5
        id={id}
        className={cn('md:text-md text-sm font-bold', {
          [`line-clamp-${lineClamp?.toString() ?? ''}`]: lineClamp,
        })}
      >
        {children}
      </h5>
    );
  }
  return (
    <h6
      id={id}
      className={cn('text-xs font-bold md:text-sm', {
        [`line-clamp-${lineClamp?.toString() ?? ''}`]: lineClamp,
      })}
    >
      {children}
    </h6>
  );
};
