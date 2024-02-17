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
    variant?: 'contained' | 'outlined';
    disabled?: boolean;
    fullWidth?: boolean;
    onClick: ReactEventHandler<HTMLButtonElement>;
    endIcon?: ReactNode;
  }>
> = ({
  children,
  type = 'button',
  size = 'md',
  variant = 'contained',
  disabled = false,
  fullWidth = false,
  onClick,
  endIcon,
}) => {
  return (
    <button
      type={type}
      className={clsx(
        'rounded-lg font-bold',
        {
          ['bg-primary hover:bg-primaryHover active:bg-primaryActive text-white']:
            variant === 'contained',
          ['hover:bg-primary active:bg-primary cursor-not-allowed opacity-50']:
            disabled && variant === 'contained',
          ['border-primary text-primary hover:bg-grayHover active:bg-grayActive border-2 bg-white']:
            variant === 'outlined',
          ['cursor-not-allowed opacity-50 hover:bg-white active:bg-white']:
            disabled && variant === 'outlined',
        },
        'focus-visible:ring-focusRing focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2',
        size === 'sm' && 'px-3 py-1 text-sm',
        size === 'md' && 'text-md px-4 py-2',
        size === 'lg' && 'px-6 py-3 text-lg',
        fullWidth && 'w-full',
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
