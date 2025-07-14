import { cn } from '@k8o/helpers/cn';
import { FC } from 'react';

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
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          onChange(Number(e.target.value));
        }}
        aria-describedby={describedbyId}
        aria-invalid={isInvalid}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        required={isRequired}
        disabled={isDisabled}
        className={cn(
          'bg-bg-subtle h-2 flex-1 cursor-pointer appearance-none rounded-lg',
          'range-slider',
          'focus:ring-border-info focus:outline-none focus:ring-2 focus:ring-opacity-50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          isInvalid && 'ring-border-error ring-2',
        )}
      />
      {showValue && (
        <span className="text-fg-base w-16 text-sm">
          {value}
          {unit}
        </span>
      )}
    </div>
  );
};
