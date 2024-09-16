import { cast } from '@/utils/number/cast';
import { cn } from '@/utils/cn';
import { FC, useState } from 'react';

type Props = {
  id?: string;
  describedbyId?: string | undefined;
  isInvalid: boolean;
  isDisabled: boolean;
  isRequired: boolean;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
};

export const NumberField: FC<Props> = ({
  id,
  describedbyId,
  isInvalid,
  isDisabled,
  isRequired,
  onChange,
  placeholder,
}) => {
  const [displayValue, setDisplayValue] = useState('');
  return (
    <div>
      <input
        id={id}
        inputMode="decimal"
        pattern="[0-9]*(.[0-9]+)?"
        role="spinbutton"
        aria-describedby={describedbyId}
        aria-invalid={isInvalid}
        aria-required={isRequired}
        aria-valuemin={-9007199254740991}
        aria-valuemax={9007199254740991}
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
          const newValue = cast(displayValue, 2);
          onChange(newValue);
          setDisplayValue(newValue.toFixed(2));
        }}
        className={cn(
          'w-full rounded-lg border border-borderPrimary bg-bgBase px-3 py-2',
          'hover:bg-bgHover',
          'aria-invalid:border-borderError',
          'disabled:cursor-not-allowed disabled:border-borderDisabled disabled:hover:bg-bgBase',
          'focus-visible:border-borderTransparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-borderFocus',
        )}
        placeholder={placeholder}
        disabled={isDisabled}
      />
    </div>
  );
};
