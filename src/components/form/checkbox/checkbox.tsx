import { cn } from '@/utils/cn';
import { Check } from 'lucide-react';
import { FC, useState } from 'react';

type Props = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
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
        onChange={(e) => {
          onChange(e.target.checked);
        }}
      />
      <span
        className={cn(
          'inline-flex size-5 items-center justify-center rounded-lg border-2',
          isFocus &&
            'bordertransparent ring-border-info ring-2 outline-hidden',
          value
            ? 'border-border-base bg-primary-bg text-fg-inverse'
            : 'border-border-mute bg-bg-base',
        )}
        aria-hidden={true}
      >
        {value ? <Check className="size-4" /> : null}
      </span>
      <span className="text-lg">{label}</span>
    </label>
  );
};
