import { cn } from '@k8o/helpers/cn';
import { between, cast, toPrecision } from '@k8o/helpers/number';
import { type FC, useState } from 'react';
import { MinusIcon, PlusIcon } from '../../icons';

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
  const [displayValue, setDisplayValue] = useState(value.toFixed(precision));

  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setDisplayValue(value.toFixed(precision));
    setPrevValue(value);
  }

  return (
    <div
      className={cn(
        'relative flex h-12 w-full items-center justify-between gap-2 rounded-md border border-border-base bg-bg-base shadow-xs',
        'focus-within:bordertransparent focus-within:outline-hidden focus-within:ring-2 focus-within:ring-border-info',
        'has-aria-invalid:border-border-error',
        'has-disabled:cursor-not-allowed has-disabled:border-border-mute has-disabled:bg-bg-mute has-disabled:has-hover:hover:bg-bg-mute',
      )}
    >
      <input
        aria-describedby={describedbyId}
        aria-invalid={isInvalid}
        aria-required={isRequired}
        aria-valuemax={max}
        aria-valuemin={min}
        aria-valuenow={value}
        autoComplete="off"
        autoCorrect="off"
        className={cn(
          'h-full w-full grow bg-transparent pr-8 pl-3 focus-visible:outline-hidden',
          'disabled:cursor-not-allowed',
        )}
        disabled={isDisabled}
        id={id}
        inputMode="decimal"
        onBlur={() => {
          const newValue = between(cast(displayValue, precision), min, max);
          onChange(newValue);
          setDisplayValue(newValue.toFixed(precision));
        }}
        onChange={(e) => {
          if ((e.nativeEvent as InputEvent).isComposing) {
            return;
          }
          setDisplayValue(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') {
            const newValue = between(
              toPrecision(cast(displayValue, precision) + step, precision),
              min,
              max,
            );
            onChange(newValue);
            setDisplayValue(newValue.toFixed(precision));
          }
          if (e.key === 'ArrowDown') {
            const newValue = between(
              toPrecision(cast(displayValue, precision) - step, precision),
              min,
              max,
            );
            onChange(newValue);
            setDisplayValue(newValue.toFixed(precision));
          }
        }}
        pattern="[0-9]*(.[0-9]+)?"
        placeholder={placeholder}
        role="spinbutton"
        type="text"
        value={displayValue}
      />
      <div aria-hidden="true" className="absolute right-0 flex h-full flex-col">
        <button
          className={cn(
            'flex w-6 grow items-center justify-center rounded-tr-sm border-border-base border-b border-l bg-bg-mute',
            'disabled:cursor-not-allowed',
          )}
          disabled={isDisabled}
          onClick={() => {
            const newValue = between(
              toPrecision(cast(displayValue, precision) + step, precision),
              min,
              max,
            );
            onChange(newValue);
            setDisplayValue(newValue.toFixed(precision));
          }}
          tabIndex={-1}
          type="button"
        >
          <span className="sr-only">増やす</span>
          <PlusIcon size="sm" />
        </button>
        <button
          className={cn(
            'flex w-6 grow items-center justify-center rounded-br-sm border-border-base border-l bg-bg-mute',
            'disabled:cursor-not-allowed',
          )}
          disabled={isDisabled}
          onClick={() => {
            const newValue = between(
              toPrecision(cast(displayValue, precision) - step, precision),
              min,
              max,
            );
            onChange(newValue);
            setDisplayValue(newValue.toFixed(precision));
          }}
          tabIndex={-1}
          type="button"
        >
          <span className="sr-only">減らす</span>
          <MinusIcon size="sm" />
        </button>
      </div>
    </div>
  );
};
