import clsx from 'clsx';
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
      className={clsx(
        'w-full rounded-lg border border-border px-3 py-2',
        'hover:bg-grayHover',
        'aria-invalid:border-error',
        'disabled:cursor-not-allowed disabled:border-borderLight disabled:bg-gray disabled:text-gray',
        'focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focusRing',
      )}
      placeholder={placeholder}
      disabled={isDisabled}
    />
  );
};
