import { FC } from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export const TextField: FC<Props> = ({
  value,
  onChange,
  placeholder,
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border-borderLight focus-visible:ring-focusRing w-full rounded-md border px-3 py-2 focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2"
      placeholder={placeholder}
    />
  );
};
