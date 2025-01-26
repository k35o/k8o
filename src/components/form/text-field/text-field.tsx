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
        'border-border-primary bg-bg-base w-full rounded-lg border px-3 py-2',
        'hover:bg-bg-hover',
        'aria-invalid:border-border-error',
        'disabled:border-border-disabled disabled:bg-bg-disabled disabled:hover:bg-bg-disabled disabled:cursor-not-allowed',
        'focus-visible:border-border-transparent focus-visible:ring-border-focus focus-visible:ring-2 focus-visible:outline-hidden',
      )}
      placeholder={placeholder}
      disabled={isDisabled}
    />
  );
};
