import { cn } from '@/utils/cn';
import { FC, HTMLProps, ReactNode } from 'react';

export const Button: FC<
  {
    type?: 'button' | 'submit';
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'gray';
    variant?: 'contained' | 'outlined';
    fullWidth?: boolean;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
  } & Omit<HTMLProps<HTMLButtonElement>, 'size' | 'type'>
> = ({
  ref,
  children,
  type = 'button',
  size = 'md',
  color = 'primary',
  variant = 'contained',
  disabled = false,
  fullWidth = false,
  onClick,
  startIcon,
  endIcon,
  ...rest
}) => {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'rounded-xl text-center font-bold',
        {
          ['bg-buttonPrimary text-textOnFill hover:bg-buttonHover active:bg-buttonActive']:
            variant === 'contained' && color === 'primary',
          ['bg-bgBase text-textBody hover:bg-bgHover active:bg-bgActive']:
            variant === 'contained' && color === 'gray',
          ['cursor-not-allowed opacity-35 hover:bg-buttonPrimary active:bg-buttonPrimary']:
            disabled && variant === 'contained',
          ['border-2 border-buttonPrimary bg-bgBase text-buttonPrimary hover:bg-bgHover active:bg-bgActive']:
            variant === 'outlined' && color === 'primary',
          ['border-2 border-borderPrimary bg-bgBase text-textBody hover:bg-bgHover active:bg-bgActive']:
            variant === 'outlined' && color === 'gray',
          ['cursor-not-allowed bg-bgBase opacity-35 hover:bg-bgBase active:bg-bgBase']:
            disabled && variant === 'outlined',
        },
        'focus-visible:border-borderTransparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-borderFocus',
        size === 'sm' && 'px-3 py-1 text-sm',
        size === 'md' && 'text-md px-4 py-2',
        size === 'lg' && 'px-6 py-3 text-lg',
        fullWidth && 'w-full',
        Boolean(startIcon || endIcon) &&
          'flex items-center justify-between gap-2',
      )}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {startIcon}
      {children}
      {endIcon}
    </button>
  );
};

Button.displayName = 'Button';
