import { FC } from 'react';

export type Option = Readonly<{
  value: string;
  label: string;
}>;

type Props = {
  labelledById: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly Option[];
};

export const Radio: FC<Props> = ({
  labelledById,
  value,
  onChange,
  options,
}) => {
  return (
    <div
      aria-labelledby={labelledById}
      role="radiogroup"
      className="flex flex-col gap-2"
    >
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-2">
          <input
            type="radio"
            className="rounded-md border border-borderLight"
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
};
