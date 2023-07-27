import clsx from 'clsx';
import { FC, PropsWithChildren, ReactEventHandler } from 'react';

export const Button: FC<
  PropsWithChildren<{
    type?: 'button' | 'submit';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    onClick: ReactEventHandler<HTMLButtonElement>;
  }>
> = ({
  children,
  type = 'button',
  size = 'md',
  fullWidth = false,
  onClick,
}) => {
  return (
    <button
      type={type}
      className={clsx(
        'rounded-lg bg-teal-400 font-bold text-white',
        'hover:bg-teal-500',
        'active:bg-teal-600',
        'focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        size === 'sm' && 'px-3 py-1 text-sm',
        size === 'md' && 'text-md px-4 py-2',
        size === 'lg' && 'px-6 py-3 text-lg',
        fullWidth && 'w-full',
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
