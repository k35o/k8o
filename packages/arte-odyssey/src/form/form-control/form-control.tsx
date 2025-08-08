import { type FC, type ReactElement, useId } from 'react';

type FormControlProps = {
  isDisabled?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  label: string;
  labelAs?: 'label' | 'legend';
  helpText?: string;
  errorText?: string | undefined;
  renderInput: (props: {
    id: string;
    describedbyId: string | undefined;
    labelId: string;
    isDisabled: boolean;
    isInvalid: boolean;
    isRequired: boolean;
  }) => ReactElement;
};

export const FormControl: FC<FormControlProps> = ({
  isDisabled = false,
  isInvalid = false,
  isRequired = false,
  label,
  labelAs = 'label',
  helpText,
  errorText,
  renderInput,
}) => {
  const id = useId();
  const describedbyId =
    isInvalid && errorText
      ? `${id}-feedback`
      : helpText
        ? `${id}-helptext`
        : undefined;
  const labelId = `${id}-label`;
  return (
    <fieldset className="flex w-full flex-col">
      {labelAs === 'label' ? (
        <label
          className="mb-1 flex gap-2 font-bold text-fg-base text-md"
          htmlFor={id}
          id={labelId}
        >
          {label}
          {isRequired && (
            <span className="font-medium text-fg-error">必須</span>
          )}
        </label>
      ) : (
        <legend className="mb-1 flex gap-2 font-bold text-fg-base text-md">
          {label}
          {isRequired && (
            <span className="font-medium text-fg-error">必須</span>
          )}
        </legend>
      )}
      {renderInput({
        id,
        describedbyId,
        labelId,
        isDisabled,
        isInvalid,
        isRequired,
      })}
      {isInvalid && errorText ? (
        <p
          aria-live="polite"
          className="text-fg-error text-sm"
          id={`${id}-feedback`}
        >
          {errorText}
        </p>
      ) : (
        helpText && (
          <p className="text-fg-mute text-sm" id={`${id}-helptext`}>
            {helpText}
          </p>
        )
      )}
    </fieldset>
  );
};
