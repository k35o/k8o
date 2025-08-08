import { cn } from '@k8o/helpers/cn';
import { type ChangeEventHandler, type FC, useEffect, useRef } from 'react';

type Props = {
  id: string;
  name?: string;
  describedbyId: string | undefined;
  isInvalid: boolean;
  isDisabled: boolean;
  isRequired: boolean;
  placeholder?: string;
  rows?: number;
  fullHeight?: boolean;
  autoResize?: boolean;
  defaultValue?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
};

export const Textarea: FC<Props> = ({
  id,
  name,
  describedbyId,
  isInvalid,
  isDisabled,
  isRequired,
  placeholder,
  rows,
  fullHeight = false,
  autoResize = false,
  defaultValue,
  value,
  onChange,
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current && autoResize) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${ref.current.scrollHeight.toString()}px`;
    }
  });
  return (
    <textarea
      aria-describedby={describedbyId}
      aria-invalid={isInvalid}
      aria-required={isRequired}
      className={cn(
        'w-full resize-none rounded-md border border-border-base bg-bg-base px-3 py-2',
        'aria-invalid:border-border-error',
        'disabled:cursor-not-allowed disabled:border-border-mute disabled:bg-bg-mute disabled:hover:bg-bg-mute',
        'focus-visible:border-transparent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-border-info',
        fullHeight && 'h-full',
      )}
      defaultValue={defaultValue}
      disabled={isDisabled}
      id={id}
      name={name}
      onChange={onChange}
      onKeyDown={(e) => {
        e.stopPropagation();
      }}
      placeholder={placeholder}
      ref={ref}
      rows={rows}
      value={value}
    />
  );
};
