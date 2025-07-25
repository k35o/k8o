import { cn } from '@k8o/helpers/cn';
import { FC, HTMLProps } from 'react';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  bg?: 'transparent' | 'base' | 'primary';
  label: string;
} & Omit<HTMLProps<HTMLButtonElement>, 'size' | 'type'>;

export const IconButton: FC<Props> = ({
  ref,
  size = 'md',
  bg = 'transparent',
  label,
  children,
  ...props
}) => {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex rounded-full bg-transparent',
        'hover:bg-bg-subtle',
        'focus-visible:ring-border-info active:bg-bg-emphasize focus-visible:border-transparent focus-visible:ring-2 focus-visible:outline-hidden',
        bg === 'base' && 'bg-bg-base/90',
        bg === 'transparent' && 'bg-transparent',
        bg === 'primary' &&
          'bg-primary-bg/90 hover:bg-primary-bg active:bg-primary-bg-emphasize',
        size === 'sm' && 'p-1',
        size === 'md' && 'p-2',
        size === 'lg' && 'p-3',
        props.disabled &&
          'cursor-not-allowed opacity-50 hover:bg-transparent active:bg-transparent',
      )}
      aria-label={props.role ? label : undefined}
      {...props}
    >
      {!props.role && <span className="sr-only">{label}</span>}
      {children}
    </button>
  );
};
