import { FC, PropsWithChildren } from 'react';
import clsx from 'clsx';

type Props = PropsWithChildren<{
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  lineClamp?: number;
}>;

export const Heading: FC<Props> = ({ children, type, lineClamp }) => {
  if (type === 'h1') {
    return (
      <h1
        className={clsx('text-3xl font-bold', {
          [`line-clamp-${lineClamp}`]: lineClamp,
        })}
      >
        {children}
      </h1>
    );
  }
  if (type === 'h2') {
    return (
      <h2
        className={clsx('text-2xl font-bold', {
          [`line-clamp-${lineClamp}`]: lineClamp,
        })}
      >
        {children}
      </h2>
    );
  }
  if (type === 'h3') {
    return (
      <h3
        className={clsx('text-xl font-bold', {
          [`line-clamp-${lineClamp}`]: lineClamp,
        })}
      >
        {children}
      </h3>
    );
  }
  if (type === 'h4') {
    return (
      <h4
        className={clsx('text-lg font-bold', {
          [`line-clamp-${lineClamp}`]: lineClamp,
        })}
      >
        {children}
      </h4>
    );
  }
  if (type === 'h5') {
    return (
      <h5
        className={clsx('font-bold', {
          [`line-clamp-${lineClamp}`]: lineClamp,
        })}
      >
        {children}
      </h5>
    );
  }
  if (type === 'h6') {
    return (
      <h6
        className={clsx('text-sm font-bold', {
          [`line-clamp-${lineClamp}`]: lineClamp,
        })}
      >
        {children}
      </h6>
    );
  }
  return null;
};
