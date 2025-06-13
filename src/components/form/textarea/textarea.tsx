import { cn } from '@/helpers/cn';
import { ChangeEventHandler, FC, useEffect, useRef } from 'react';

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
} & (
  | {
      defaultValue?: string;
    }
  | {
      value: string;
      onChange: ChangeEventHandler<HTMLTextAreaElement>;
    }
);

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
  ...props
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current && autoResize) {
      ref.current.style.height = 'auto';
      ref.current.style.height =
        ref.current.scrollHeight.toString() + 'px';
    }
  });
  return (
    <textarea
      id={id}
      ref={ref}
      name={name}
      aria-describedby={describedbyId}
      aria-invalid={isInvalid}
      aria-required={isRequired}
      className={cn(
        'border-border-base bg-bg-base w-full resize-none rounded-md border px-3 py-2',
        'aria-invalid:border-border-error',
        'disabled:border-border-mute disabled:bg-bg-mute disabled:hover:bg-bg-mute disabled:cursor-not-allowed',
        'focus-visible:ring-border-info focus-visible:border-transparent focus-visible:ring-2 focus-visible:outline-hidden',
        fullHeight && 'h-full',
      )}
      disabled={isDisabled}
      placeholder={placeholder}
      rows={rows}
      onKeyDown={(e) => {
        e.stopPropagation();
      }}
      {...props}
    />
  );
};
