import { cn } from '@/utils/cn';
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
        'w-full resize-none rounded-lg border border-borderPrimary bg-bgBase px-3 py-2',
        'hover:bg-bgHover',
        'aria-invalid:border-borderError',
        'disabled:cursor-not-allowed disabled:border-borderDisabled disabled:hover:bg-bgBase',
        'focus-visible:border-borderTransparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-borderFocus',
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
