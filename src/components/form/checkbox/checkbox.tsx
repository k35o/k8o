import { CheckIcon } from '../../icons';
import { cn } from '@/helpers/cn';
import { ChangeEventHandler, FC, useState } from 'react';

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
        type="checkbox"
        className="sr-only"
        checked={value}
        onFocus={() => {
          setIsFocus(true);
        }}
        onBlur={() => {
          setIsFocus(false);
        }}
        onChange={onChange}
      />
      <span
        className={cn(
          'inline-flex size-5 items-center justify-center rounded-md border-2',
          isFocus &&
            'bordertransparent ring-border-info ring-2 outline-hidden',
          value
            ? 'border-border-base bg-primary-bg text-fg-base'
            : 'border-border-mute bg-bg-base',
        )}
        aria-hidden={true}
      >
        {value ? <CheckIcon size="sm" /> : null}
      </span>
      <span className="text-lg">{label}</span>
    </label>
  );
};
