import clsx from 'clsx';
import { FC, PropsWithChildren } from 'react';

export const Accordion: FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  return (
    <div
      className={clsx(
        'rounded-md border-2 p-2',
        'focus-within:ring-focusRing focus-within:border-transparent focus-within:outline-none focus-within:ring-2',
      )}
    >
      {children}
    </div>
  );
};
