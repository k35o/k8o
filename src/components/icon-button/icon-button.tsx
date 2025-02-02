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
        'bgtransparent inline-flex rounded-full',
        'hover:bg-bg-subtle',
        'focus-visible:bordertransparent focus-visible:ring-border-info active:bg-bg-emphasize focus-visible:ring-2 focus-visible:outline-hidden',
        bg === 'base' && 'bg-bg-base/55',
        bg === 'transparent' && 'bgtransparent',
        size === 'sm' && 'p-1',
        size === 'md' && 'p-2',
        size === 'lg' && 'p-3',
        props.disabled &&
          'hover:bgtransparent active:bgtransparent cursor-not-allowed opacity-50',
      )}
      aria-label={label}
      {...props}
    />
  );
};
