import { cn } from '@/utils/cn';
import { FC, PropsWithChildren, ReactEventHandler } from 'react';

type Props = PropsWithChildren<{
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  label?: string;
  onClick: ReactEventHandler<HTMLButtonElement>;
}>;

export const IconButton: FC<Props> = ({
  size = 'md',
  disabled = false,
  label,
  onClick,
  children,
}) => {
  return (
    <button
      className={cn(
        'inline-flex rounded-full bg-transparent hover:bg-grayHover focus-visible:ring-2 focus-visible:ring-focusRing active:bg-grayActive',
        size === 'sm' && 'p-1',
        size === 'md' && 'p-2',
        size === 'lg' && 'p-3',
        disabled &&
          'cursor-not-allowed opacity-50 hover:bg-transparent active:bg-transparent',
      )}
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
    >
      {children}
    </button>
  );
};
