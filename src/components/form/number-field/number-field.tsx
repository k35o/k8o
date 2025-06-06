import { MinusIcon, PlusIcon } from '../../icons';
import { cn } from '@/utils/cn';
import { between } from '@/utils/number/between';
import { cast } from '@/utils/number/cast';
import { toPrecision } from '@/utils/number/to-precision';
import { FC, useState } from 'react';

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
        'border-border-base bg-bg-base relative flex h-12 w-full items-center justify-between gap-2 rounded-md border shadow-xs',
        'focus-within:bordertransparent focus-within:ring-border-info focus-within:ring-2 focus-within:outline-hidden',
        'has-aria-invalid:border-border-error',
        'has-disabled:border-border-mute has-disabled:has-hover:hover:bg-bg-mute has-disabled:bg-bg-mute has-disabled:cursor-not-allowed',
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
          'bgtransparent h-full w-full grow pr-8 pl-3 focus-visible:outline-hidden',
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
            'bg-bg-mute border-border-base flex w-6 grow items-center justify-center rounded-tr-sm border-b border-l',
            'disabled:cursor-not-allowed',
          )}
          disabled={isDisabled}
        >
          <span className="sr-only">増やす</span>
          <PlusIcon size="sm" />
        </button>
        <button
          type="button"
          tabIndex={-1}
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
            'bg-bg-mute border-border-base flex w-6 grow items-center justify-center rounded-br-sm border-l',
            'disabled:cursor-not-allowed',
          )}
          disabled={isDisabled}
        >
          <span className="sr-only">減らす</span>
          <MinusIcon size="sm" />
        </button>
      </div>
    </div>
  );
};
