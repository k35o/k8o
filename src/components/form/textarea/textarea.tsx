import clsx from 'clsx';
import { FC, useEffect, useRef } from 'react';

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  fullHeight?: boolean;
  autoResize?: boolean;
};

export const Textarea: FC<Props> = ({
  id,
  value,
  onChange,
  placeholder,
  rows,
  fullHeight = false,
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
      id={id}
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={clsx(
        'w-full resize-none rounded-md border border-borderLight px-3 py-2 focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focusRing',
        fullHeight && 'h-full',
      )}
      placeholder={placeholder}
      rows={rows}
      onKeyDown={(e) => {
        e.stopPropagation();
      }}
    />
  );
};
