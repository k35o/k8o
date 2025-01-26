import { cn } from '@/utils/cn';
import { FC } from 'react';

export type Option = Readonly<{
  value: string;
  label: string;
}>;

type Props = {
  labelId: string;
  isDisabled: boolean;
  value: string;
  onChange: (value: string) => void;
  options: readonly Option[];
};

export const Radio: FC<Props> = ({
  labelId,
  isDisabled,
  value,
  onChange,
  options,
}) => {
  return (
    <div
      aria-labelledby={labelId}
      role="radiogroup"
      className={cn(
        'flex cursor-pointer flex-col gap-2',
        isDisabled && 'cursor-not-allowed',
      )}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            'flex cursor-pointer items-center gap-2',
            'has-disabled:cursor-not-allowed',
          )}
        >
          <input
            type="radio"
            className={cn(
              'cursor-pointer',
              'disabled:bg-bg-disabled disabled:cursor-not-allowed',
            )}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => {
              onChange(e.target.value);
            }}
            disabled={isDisabled}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
};
