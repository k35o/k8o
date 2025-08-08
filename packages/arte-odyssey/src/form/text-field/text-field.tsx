import { cn } from '@k8o/helpers/cn';
import type { ChangeEventHandler, FC } from 'react';

type Props = {
  id?: string;
  name?: string;
  describedbyId?: string | undefined;
  isInvalid: boolean;
  isDisabled: boolean;
  isRequired: boolean;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

export const TextField: FC<Props> = ({
  id,
  name,
  describedbyId,
  isInvalid,
  isDisabled,
  isRequired,
  placeholder,
  defaultValue,
  value,
  onChange,
}) => {
  return (
    <input
      aria-describedby={describedbyId}
      aria-invalid={isInvalid}
      aria-required={isRequired}
      className={cn(
        'w-full rounded-md border border-border-base bg-bg-base px-3 py-2',
        'aria-invalid:border-border-error',
        'disabled:cursor-not-allowed disabled:border-border-mute disabled:bg-bg-mute disabled:hover:bg-bg-mute',
        'focus-visible:border-transparent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-border-info',
      )}
      defaultValue={defaultValue}
      disabled={isDisabled}
      id={id}
      name={name}
      onChange={onChange}
      placeholder={placeholder}
      type="text"
      value={value}
    />
  );
};
