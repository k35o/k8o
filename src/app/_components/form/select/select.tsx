import { FC } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

export type Option = Readonly<{
  value: string;
  label: string;
}>;

type Props = {
  options: readonly Option[];
  value: string;
  onChange: (value: string) => void;
};

export const Select: FC<Props> = ({ options, value, onChange }) => {
  return (
    <div className="relative h-fit w-full">
      <select
        className="focus-visible:ring-focusRing border-border w-full appearance-none rounded-md border px-3 py-2 shadow-sm focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-2/4 -translate-y-1/2">
        <ChevronDownIcon className="h-4 w-4" />
      </div>
    </div>
  );
};
