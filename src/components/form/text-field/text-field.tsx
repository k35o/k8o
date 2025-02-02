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
        'border-border-base bg-bg-base w-full rounded-lg border px-3 py-2',
        'aria-invalid:border-border-error',
        'disabled:border-border-mute disabled:bg-bg-mute disabled:hover:bg-bg-mute disabled:cursor-not-allowed',
        'focus-visible:bordertransparent focus-visible:ring-border-info focus-visible:ring-2 focus-visible:outline-hidden',
      )}
      placeholder={placeholder}
      disabled={isDisabled}
    />
  );
};
