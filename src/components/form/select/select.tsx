import { FC } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

export type Option = Readonly<{
  value: string;
  label: string;
}>;

type Props = {
  id: string;
  describedbyId: string | undefined;
  isInvalid: boolean;
  isDisabled: boolean;
  isRequired: boolean;
  options: readonly Option[];
  value: string;
  onChange: (value: string) => void;
};

export const Select: FC<Props> = ({
  id,
  describedbyId,
  isInvalid,
  isDisabled,
  isRequired,
  options,
  value,
  onChange,
}) => {
  return (
    <div className="relative h-fit w-full">
      <select
        id={id}
        aria-describedby={describedbyId}
        aria-invalid={isInvalid}
        aria-required={isRequired}
        className={clsx(
          'w-full appearance-none rounded-lg border border-border px-3 py-2 shadow-sm',
          'hover:bg-grayHover',
          'aria-invalid:border-error',
          'disabled:cursor-not-allowed disabled:border-borderLight disabled:bg-gray disabled:text-gray',
          'focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focusRing',
        )}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isDisabled}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-2/4 -translate-y-1/2">
        <ChevronDownIcon className="size-4" />
      </div>
    </div>
  );
};
