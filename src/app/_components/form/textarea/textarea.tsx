import { FC, useEffect, useRef } from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  autoResize?: boolean;
};

export const Textarea: FC<Props> = ({
  value,
  onChange,
  placeholder,
  rows,
  autoResize = false,
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current && autoResize) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  });
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border-border focus-visible:ring-focusRing w-full rounded-md border px-3 py-2 focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2"
      placeholder={placeholder}
      rows={rows}
      onKeyDown={(e) => {
        e.stopPropagation();
      }}
    />
  );
};
