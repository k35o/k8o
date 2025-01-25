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
          ['bg-button-primary text-text-on-fill hover:bg-button-hover active:bg-button-active']:
            variant === 'contained' && color === 'primary',
          ['bg-bg-base text-text-body hover:bg-bg-hover active:bg-bg-active']:
            variant === 'contained' && color === 'gray',
          ['hover:bg-button-primary active:bg-button-primary cursor-not-allowed opacity-35']:
            disabled && variant === 'contained',
          ['border-button-primary bg-bg-base text-button-primary hover:bg-bg-hover active:bg-bg-active border-2']:
            variant === 'outlined' && color === 'primary',
          ['border-border-primary bg-bg-base text-text-body hover:bg-bg-hover active:bg-bg-active border-2']:
            variant === 'outlined' && color === 'gray',
          ['bg-bg-base hover:bg-bg-base active:bg-bg-base cursor-not-allowed opacity-35']:
            disabled && variant === 'outlined',
        },
        'focus-visible:border-border-transparent focus-visible:ring-border-focus focus-visible:ring-2 focus-visible:outline-hidden',
        size === 'sm' && 'px-3 py-1 text-sm',
        size === 'md' && 'text-md px-4 py-2',
        size === 'lg' && 'px-6 py-3 text-lg',
        fullWidth && 'w-full',
        Boolean(startIcon ?? endIcon) &&
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
