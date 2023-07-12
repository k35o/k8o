import { FC } from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
};

export const Textarea: FC<Props> = ({
  value,
  onChange,
  placeholder,
  rows,
}) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder={placeholder}
      rows={rows}
    />
  );
};
