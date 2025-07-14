import { cn } from '@k8o/helpers/cn';
import { ChangeEventHandler, FC } from 'react';

type Props = {
  id?: string;
  name?: string;
  describedbyId?: string | undefined;
  isInvalid: boolean;
  isDisabled: boolean;
  isRequired: boolean;
  placeholder?: string;
} & (
  | {
      defaultValue?: string;
    }
  | {
      value: string;
      onChange: ChangeEventHandler<HTMLInputElement>;
    }
);

export const TextField: FC<Props> = ({
  id,
  describedbyId,
  isInvalid,
  isDisabled,
  isRequired,
  placeholder,
  ...props
}) => {
  return (
    <input
      id={id}
      aria-describedby={describedbyId}
      aria-invalid={isInvalid}
      aria-required={isRequired}
      type="text"
      className={cn(
        'border-border-base bg-bg-base w-full rounded-md border px-3 py-2',
        'aria-invalid:border-border-error',
        'disabled:border-border-mute disabled:bg-bg-mute disabled:hover:bg-bg-mute disabled:cursor-not-allowed',
        'focus-visible:ring-border-info focus-visible:outline-hidden focus-visible:border-transparent focus-visible:ring-2',
      )}
      placeholder={placeholder}
      disabled={isDisabled}
      {...props}
    />
  );
};
