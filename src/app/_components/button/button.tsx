import clsx from 'clsx';
import {
  FC,
  PropsWithChildren,
  ReactEventHandler,
  ReactNode,
} from 'react';

export const Button: FC<
  PropsWithChildren<{
    type?: 'button' | 'submit';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    fullWidth?: boolean;
    onClick: ReactEventHandler<HTMLButtonElement>;
    endIcon?: ReactNode;
  }>
> = ({
  children,
  type = 'button',
  size = 'md',
  disabled = false,
  fullWidth = false,
  onClick,
  endIcon,
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
        disabled &&
          'cursor-not-allowed opacity-50 hover:bg-teal-400 active:bg-teal-400',
        endIcon && 'flex items-center justify-between gap-2',
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
      {endIcon}
    </button>
  );
};
