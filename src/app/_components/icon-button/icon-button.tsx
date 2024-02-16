import { FC, PropsWithChildren, ReactEventHandler } from 'react';

type Props = PropsWithChildren<{
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  label: string;
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
      className={`
        flex items-center justify-center
        rounded-full bg-white
        hover:bg-gray-100
        focus-visible:ring-2
        focus-visible:ring-blue-500 active:bg-gray-200
        ${size === 'sm' && 'p-1'}
        ${size === 'md' && 'p-2'}
        ${size === 'lg' && 'p-3'}
        ${disabled && 'cursor-not-allowed opacity-50 hover:bg-white active:bg-white'}
      `}
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
    >
      {children}
    </button>
  );
};
