import { cn } from '@k8o/helpers/cn';
import type { FC, HTMLProps, ReactNode } from 'react';

export const Button: FC<
  {
    type?: 'button' | 'submit';
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'gray';
    variant?: 'contained' | 'outlined' | 'skeleton';
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
      className={cn(
        'cursor-pointer rounded-lg text-center font-bold',
        {
          'bg-primary-bg text-fg hover:bg-primary-bg/90 active:bg-primary-bg/80':
            variant === 'contained' && color === 'primary',
          'bg-bg-subtle text-fg-base hover:bg-bg-mute active:bg-bg-emphasize':
            variant === 'contained' && color === 'gray',
          'cursor-not-allowed opacity-35 hover:bg-primary-bg active:bg-primary-bg':
            disabled && variant === 'contained',
          'border-2 border-primary-border bg-bg-base text-primary-fg hover:bg-bg-subtle active:bg-bg-emphasize':
            variant === 'outlined' && color === 'primary',
          'border-2 border-border-base bg-bg-base text-fg-base hover:bg-bg-subtle active:bg-bg-emphasize':
            variant === 'outlined' && color === 'gray',
          'cursor-not-allowed bg-bg-base opacity-35 hover:bg-bg-base active:bg-bg-base':
            disabled && variant === 'outlined',
          'bg-transparent text-fg-mute hover:text-fg-base active:text-fg-base':
            variant === 'skeleton',
          'cursor-not-allowed bg-transparent text-fg-mute opacity-35 hover:text-fg-mute active:text-fg-mute':
            disabled && variant === 'skeleton',
        },
        'focus-visible:border-transparent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-border-info',
        size === 'sm' && 'px-3 py-1 text-sm',
        size === 'md' && 'px-4 py-2 text-md',
        size === 'lg' && 'px-6 py-3 text-lg',
        fullWidth && 'w-full',
        Boolean(startIcon ?? endIcon) && 'flex items-center gap-2',
        startIcon && endIcon
          ? 'justify-between'
          : startIcon && variant !== 'skeleton'
            ? 'justify-center'
            : endIcon && 'justify-between',
      )}
      disabled={disabled}
      onClick={onClick}
      ref={ref}
      type={type}
      {...rest}
    >
      {startIcon}
      {children}
      {endIcon}
    </button>
  );
};
