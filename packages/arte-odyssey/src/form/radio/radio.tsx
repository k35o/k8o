import { cn } from '@k8o/helpers/cn';
import type { ChangeEventHandler, FC } from 'react';

export type Option = Readonly<{
  value: string;
  label: string;
}>;

type Props = {
  labelId: string;
  isDisabled: boolean;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
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
      className={cn(
        'flex cursor-pointer flex-col gap-2',
        isDisabled && 'cursor-not-allowed',
      )}
      role="radiogroup"
    >
      {options.map((option) => (
        <label
          className={cn(
            'flex cursor-pointer items-center gap-2',
            'has-disabled:cursor-not-allowed',
          )}
          key={option.value}
        >
          <input
            checked={value === option.value}
            className={cn(
              'cursor-pointer',
              'disabled:cursor-not-allowed disabled:bg-bg-mute',
            )}
            disabled={isDisabled}
            onChange={onChange}
            type="radio"
            value={option.value}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
};
