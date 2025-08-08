import { cn } from '@k8o/helpers/cn';
import type { FC } from 'react';

type Props = {
  id?: string;
  describedbyId?: string | undefined;
  isInvalid: boolean;
  isDisabled: boolean;
  isRequired: boolean;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  max?: number;
  min?: number;
  showValue?: boolean;
  unit?: string;
};

export const RangeField: FC<Props> = ({
  id,
  describedbyId,
  isInvalid,
  isDisabled,
  isRequired,
  value,
  onChange,
  step = 1,
  max = 100,
  min = 0,
  showValue = true,
  unit = '',
}) => {
  return (
    <div className="flex items-center gap-4">
      <input
        aria-describedby={describedbyId}
        aria-invalid={isInvalid}
        aria-valuemax={max}
        aria-valuemin={min}
        aria-valuenow={value}
        className={cn(
          'h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-bg-subtle',
          'range-slider',
          'focus:outline-none focus:ring-2 focus:ring-border-info focus:ring-opacity-50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          isInvalid && 'ring-2 ring-border-error',
        )}
        disabled={isDisabled}
        id={id}
        max={max}
        min={min}
        onChange={(e) => {
          onChange(Number(e.target.value));
        }}
        required={isRequired}
        step={step}
        type="range"
        value={value}
      />
      {showValue && (
        <span className="w-16 text-fg-base text-sm">
          {value}
          {unit}
        </span>
      )}
    </div>
  );
};
