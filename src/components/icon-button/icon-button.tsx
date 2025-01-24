import { cn } from '@/utils/cn';
import { FC, HTMLProps } from 'react';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  bg?: 'transparent' | 'base';
  label?: string;
} & Omit<HTMLProps<HTMLButtonElement>, 'size' | 'type'>;

export const IconButton: FC<Props> = ({
  ref,
  size = 'md',
  bg = 'transparent',
  label,
  ...props
}) => {
  return (
    <button
      ref={ref}
      className={cn(
        'bg-bgTransparent inline-flex rounded-full',
        'hover:bg-bgHover',
        'focus-visible:border-borderTransparent focus-visible:ring-borderFocus active:bg-bgActive focus-visible:ring-2 focus-visible:outline-hidden',
        bg === 'base' && 'bg-bgBase/55',
        bg === 'transparent' && 'bg-bgTransparent',
        size === 'sm' && 'p-1',
        size === 'md' && 'p-2',
        size === 'lg' && 'p-3',
        props.disabled &&
          'hover:bg-bgTransparent active:bg-bgTransparent cursor-not-allowed opacity-50',
      )}
      aria-label={label}
      {...props}
    />
  );
};

IconButton.displayName = 'IconButton';
