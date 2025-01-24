import { cn } from '@/utils/cn';
import { FC } from 'react';

type Props = {
  id?: string;
  describedbyId?: string | undefined;
  isInvalid: boolean;
  isDisabled: boolean;
  isRequired: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export const TextField: FC<Props> = ({
  id,
  describedbyId,
  isInvalid,
  isDisabled,
  isRequired,
  value,
  onChange,
  placeholder,
}) => {
  return (
    <input
      id={id}
      aria-describedby={describedbyId}
      aria-invalid={isInvalid}
      aria-required={isRequired}
      type="text"
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      className={cn(
        'border-borderPrimary bg-bgBase w-full rounded-lg border px-3 py-2',
        'hover:bg-bgHover',
        'aria-invalid:border-borderError',
        'disabled:border-borderDisabled disabled:hover:bg-bgBase disabled:cursor-not-allowed',
        'focus-visible:border-borderTransparent focus-visible:ring-borderFocus focus-visible:ring-2 focus-visible:outline-hidden',
      )}
      placeholder={placeholder}
      disabled={isDisabled}
    />
  );
};
