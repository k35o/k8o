import { cn } from '@k8o/helpers/cn';
import type { ChangeEventHandler, FC } from 'react';
import { ChevronIcon } from './../../icons';

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
  onChange: ChangeEventHandler<HTMLSelectElement>;
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
        aria-describedby={describedbyId}
        aria-invalid={isInvalid}
        aria-required={isRequired}
        className={cn(
          'w-full appearance-none rounded-md border border-border-base bg-bg-base px-3 py-2 shadow-xs',
          'aria-invalid:border-border-error',
          'disabled:cursor-not-allowed disabled:border-border-mute disabled:bg-bg-mute disabled:hover:bg-bg-mute',
          'focus-visible:border-transparent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-border-info',
        )}
        disabled={isDisabled}
        id={id}
        onChange={onChange}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="-translate-y-1/2 absolute top-2/4 right-3">
        <ChevronIcon direction="down" size="sm" />
      </div>
    </div>
  );
};
