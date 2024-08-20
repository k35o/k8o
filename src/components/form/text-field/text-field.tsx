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
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'w-full rounded-lg border border-borderPrimary bg-bgBase px-3 py-2',
        'hover:bg-bgHover',
        'aria-invalid:border-borderError',
        'disabled:cursor-not-allowed disabled:border-borderDisabled disabled:hover:bg-bgBase',
        'focus-visible:border-borderTransparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-borderFocus',
      )}
      placeholder={placeholder}
      disabled={isDisabled}
    />
  );
};
