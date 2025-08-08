import { cn } from '@k8o/helpers/cn';
import { type ChangeEventHandler, type FC, useState } from 'react';
import { CheckIcon } from '../../icons';

type Props = {
  label: string;
  value: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

export const Checkbox: FC<Props> = ({ label, value, onChange }) => {
  const [isFocus, setIsFocus] = useState(false);
  return (
    <label className="inline-flex cursor-pointer items-center gap-2">
      <input
        checked={value}
        className="sr-only"
        onBlur={() => {
          setIsFocus(false);
        }}
        onChange={onChange}
        onFocus={() => {
          setIsFocus(true);
        }}
        type="checkbox"
      />
      <span
        aria-hidden={true}
        className={cn(
          'inline-flex size-5 items-center justify-center rounded-md border-2',
          isFocus && 'bordertransparent outline-hidden ring-2 ring-border-info',
          value
            ? 'border-border-base bg-primary-bg text-fg-base'
            : 'border-border-mute bg-bg-base',
        )}
      >
        {value ? <CheckIcon size="sm" /> : null}
      </span>
      <span className="text-lg">{label}</span>
    </label>
  );
};
