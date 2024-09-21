import { cn } from '@/utils/cn';
import {
  FC,
  forwardRef,
  PropsWithChildren,
  ReactEventHandler,
} from 'react';

type Props = PropsWithChildren<{
  size?: 'sm' | 'md' | 'lg';
  bg?: 'transparent' | 'base';
  disabled?: boolean;
  label?: string;
  onClick?: ReactEventHandler<HTMLButtonElement>;
}>;

export const IconButton = forwardRef<HTMLButtonElement, Props>(
  (
    {
      size = 'md',
      bg = 'transparent',
      disabled = false,
      label,
      onClick,
      children,
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex rounded-full bg-bgTransparent',
          'hover:bg-bgHover',
          'focus-visible:border-borderTransparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-borderFocus active:bg-bgActive',
          bg === 'base' && 'bg-bgBase/55',
          bg === 'transparent' && 'bg-bgTransparent',
          size === 'sm' && 'p-1',
          size === 'md' && 'p-2',
          size === 'lg' && 'p-3',
          disabled &&
            'cursor-not-allowed opacity-50 hover:bg-bgTransparent active:bg-bgTransparent',
        )}
        disabled={disabled}
        onClick={onClick}
        aria-label={label}
      >
        {children}
      </button>
    );
  },
);

IconButton.displayName = 'IconButton';
