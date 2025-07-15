import { ChevronIcon } from '@/components/icons';
import { cn } from '@k8o/helpers/cn';
import { ChangeEventHandler, FC } from 'react';

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
        id={id}
        aria-describedby={describedbyId}
        aria-invalid={isInvalid}
        aria-required={isRequired}
        className={cn(
          'border-border-base bg-bg-base shadow-xs w-full appearance-none rounded-md border px-3 py-2',
          'aria-invalid:border-border-error',
          'disabled:border-border-mute disabled:bg-bg-mute disabled:hover:bg-bg-mute disabled:cursor-not-allowed',
          'focus-visible:ring-border-info focus-visible:outline-hidden focus-visible:border-transparent focus-visible:ring-2',
        )}
        value={value}
        onChange={onChange}
        disabled={isDisabled}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-2/4 -translate-y-1/2">
        <ChevronIcon size="sm" direction="down" />
      </div>
    </div>
  );
};
