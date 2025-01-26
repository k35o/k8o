import { cast } from '@/utils/number/cast';
import { cn } from '@/utils/cn';
import { FC, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { between } from '@/utils/number/between';
import { toPrecision } from '@/utils/number/to-precision';

type Props = {
  id?: string;
  describedbyId?: string | undefined;
  isInvalid: boolean;
  isDisabled: boolean;
  isRequired: boolean;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  precision?: number;
  max?: number;
  min?: number;
  placeholder?: string;
};

export const NumberField: FC<Props> = ({
  id,
  describedbyId,
  isInvalid,
  isDisabled,
  isRequired,
  value,
  onChange,
  step = 1,
  precision = 0,
  max = 9007199254740991,
  min = -9007199254740991,
  placeholder,
}) => {
  const [displayValue, setDisplayValue] = useState(
    value.toFixed(precision),
  );

  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setDisplayValue(value.toFixed(precision));
    setPrevValue(value);
  }

  return (
    <div
      className={cn(
        'border-border-primary bg-bg-base relative flex h-12 w-full items-center justify-between gap-2 rounded-lg border shadow-xs',
        'focus-within:border-border-transparent focus-within:ring-border-focus focus-within:ring-2 focus-within:outline-hidden',
        'has-[input:hover]:bg-bg-active',
        'has-aria-invalid:border-border-error',
        'has-disabled:border-border-disabled has-disabled:has-hover:hover:bg-bg-disabled has-disabled:bg-bg-disabled has-disabled:cursor-not-allowed',
      )}
    >
      <input
        id={id}
        inputMode="decimal"
        pattern="[0-9]*(.[0-9]+)?"
        role="spinbutton"
        aria-describedby={describedbyId}
        aria-invalid={isInvalid}
        aria-required={isRequired}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        autoComplete="off"
        autoCorrect="off"
        type="text"
        value={displayValue}
        onChange={(e) => {
          if ((e.nativeEvent as InputEvent).isComposing) {
            return;
          }
          setDisplayValue(e.target.value);
        }}
        onBlur={() => {
          const newValue = between(
            cast(displayValue, precision),
            min,
            max,
          );
          onChange(newValue);
          setDisplayValue(newValue.toFixed(precision));
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') {
            const newValue = between(
              toPrecision(
                cast(displayValue, precision) + step,
                precision,
              ),
              min,
              max,
            );
            onChange(newValue);
            setDisplayValue(newValue.toFixed(precision));
          }
          if (e.key === 'ArrowDown') {
            const newValue = between(
              toPrecision(
                cast(displayValue, precision) - step,
                precision,
              ),
              min,
              max,
            );
            onChange(newValue);
            setDisplayValue(newValue.toFixed(precision));
          }
        }}
        className={cn(
          'bg-bg-transparent h-full w-full grow pr-8 pl-3 focus-visible:outline-hidden',
          'disabled:cursor-not-allowed',
        )}
        placeholder={placeholder}
        disabled={isDisabled}
      />
      <div
        aria-hidden="true"
        className="absolute right-0 flex h-full flex-col"
      >
        <button
          type="button"
          aria-label="増やす"
          tabIndex={-1}
          onClick={() => {
            const newValue = between(
              toPrecision(
                cast(displayValue, precision) + step,
                precision,
              ),
              min,
              max,
            );
            onChange(newValue);
            setDisplayValue(newValue.toFixed(precision));
          }}
          className={cn(
            'bg-bg-secondary flex w-6 grow items-center justify-center rounded-tr-lg border-b border-l',
            'disabled:cursor-not-allowed',
          )}
          disabled={isDisabled}
        >
          <Plus className="size-3" />
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-label="減らす"
          onClick={() => {
            const newValue = between(
              toPrecision(
                cast(displayValue, precision) - step,
                precision,
              ),
              min,
              max,
            );
            onChange(newValue);
            setDisplayValue(newValue.toFixed(precision));
          }}
          className={cn(
            'bg-bg-secondary flex w-6 grow items-center justify-center rounded-br-lg border-l',
            'disabled:cursor-not-allowed',
          )}
          disabled={isDisabled}
        >
          <Minus className="size-3" />
        </button>
      </div>
    </div>
  );
};
