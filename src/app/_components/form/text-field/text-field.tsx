import { FC } from 'react';

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export const TextField: FC<Props> = ({
  id,
  value,
  onChange,
  placeholder,
}) => {
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border-borderLight focus-visible:ring-focusRing w-full rounded-md border px-3 py-2 focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2"
      placeholder={placeholder}
    />
  );
};
