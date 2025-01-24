import { FC } from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';

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
        className={cn(
          'border-borderPrimary bg-bgBase w-full appearance-none rounded-lg border px-3 py-2 shadow-xs',
          'hover:bg-bgHover',
          'aria-invalid:border-borderError',
          'disabled:border-borderDisabled disabled:hover:bg-bgBase disabled:cursor-not-allowed',
          'focus-visible:border-borderTransparent focus-visible:ring-borderFocus focus-visible:ring-2 focus-visible:outline-hidden',
        )}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        disabled={isDisabled}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute top-2/4 right-3 -translate-y-1/2">
        <ChevronDown className="size-4" />
      </div>
    </div>
  );
};
