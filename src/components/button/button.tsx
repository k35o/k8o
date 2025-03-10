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
        'rounded-lg text-center font-bold',
        {
          ['bg-primary-bg text-fg hover:bg-primary-bg/90 active:bg-primary-bg/80']:
            variant === 'contained' && color === 'primary',
          ['bg-bg-base text-fg-base hover:bg-bg-subtle active:bg-bg-emphasize']:
            variant === 'contained' && color === 'gray',
          ['hover:bg-primary-bg active:bg-primary-bg cursor-not-allowed opacity-35']:
            disabled && variant === 'contained',
          ['border-primary-border bg-bg-base text-primary-fg hover:bg-bg-subtle active:bg-bg-emphasize border-2']:
            variant === 'outlined' && color === 'primary',
          ['border-border-base bg-bg-base text-fg-base hover:bg-bg-subtle active:bg-bg-emphasize border-2']:
            variant === 'outlined' && color === 'gray',
          ['bg-bg-base hover:bg-bg-base active:bg-bg-base cursor-not-allowed opacity-35']:
            disabled && variant === 'outlined',
        },
        'focus-visible:bordertransparent focus-visible:ring-border-info focus-visible:ring-2 focus-visible:outline-hidden',
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
