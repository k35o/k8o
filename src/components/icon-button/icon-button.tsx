import { cn } from '@/utils/cn';
import { FC, PropsWithChildren, ReactEventHandler } from 'react';

type Props = PropsWithChildren<{
  size?: 'sm' | 'md' | 'lg';
  bg?: 'transparent' | 'base';
  disabled?: boolean;
  label?: string;
  onClick: ReactEventHandler<HTMLButtonElement>;
}>;

export const IconButton: FC<Props> = ({
  size = 'md',
  bg = 'transparent',
  disabled = false,
  label,
  onClick,
  children,
}) => {
  return (
    <button
      className={cn(
        'inline-flex rounded-full bg-bgTransparent hover:bg-bgHover focus-visible:ring-2 focus-visible:ring-borderFocus active:bg-bgActive',
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
};
