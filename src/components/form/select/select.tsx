import { Chevron } from '@/components/icons';
import { cn } from '@/utils/cn';
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
          'border-border-base bg-bg-base w-full appearance-none rounded-md border px-3 py-2 shadow-xs',
          'aria-invalid:border-border-error',
          'disabled:border-border-mute disabled:bg-bg-mute disabled:hover:bg-bg-mute disabled:cursor-not-allowed',
          'focus-visible:bordertransparent focus-visible:ring-border-info focus-visible:ring-2 focus-visible:outline-hidden',
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
      <div className="absolute top-2/4 right-3 -translate-y-1/2">
        <Chevron size="sm" direction="down" />
      </div>
    </div>
  );
};
