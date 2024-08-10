import { cn } from '@/utils/cn';
import { CheckIcon } from '@heroicons/react/24/solid';
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
        className="invisible-input-checkbox"
        checked={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        className={cn(
          'inline-flex size-5 items-center justify-center rounded-lg border-2',
          isFocus &&
            'border-transparent outline-none ring-2 ring-focusRing',
          value
            ? 'border-primary bg-primary text-white'
            : 'border-borderLight',
        )}
        aria-hidden={true}
      >
        {value ? <CheckIcon className="size-4" /> : null}
      </span>
      <span className="text-lg">{label}</span>
    </label>
  );
};
