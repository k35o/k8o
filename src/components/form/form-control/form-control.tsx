import { FC, ReactElement, useId } from 'react';

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
    <fieldset role="group" className="flex w-full flex-col">
      {labelAs === 'label' ? (
        <label
          id={labelId}
          htmlFor={id}
          className="text-md text-fg-base mb-1 flex gap-2 font-bold"
        >
          {label}
          {isRequired && (
            <span className="text-fg-error font-medium">必須</span>
          )}
        </label>
      ) : (
        <legend className="text-md text-fg-base mb-1 flex gap-2 font-bold">
          {label}
          {isRequired && (
            <span className="text-fg-error font-medium">必須</span>
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
          id={`${id}-feedback`}
          className="text-fg-error text-sm"
          aria-live="polite"
        >
          {errorText}
        </p>
      ) : (
        helpText && (
          <p id={`${id}-helptext`} className="text-fg-mute text-sm">
            {helpText}
          </p>
        )
      )}
    </fieldset>
  );
};
