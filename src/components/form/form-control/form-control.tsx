import { FC, useId } from 'react';

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
    isDisabled: boolean;
    isInvalid: boolean;
    isRequired: boolean;
  }) => JSX.Element;
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
  return (
    <div role="group" className="flex flex-col gap-2">
      {labelAs === 'label' ? (
        <label
          htmlFor={id}
          className="text-textPrimary text-md flex gap-2 font-bold"
        >
          {label}
          {isRequired && (
            <span className="font-medium text-error">必須</span>
          )}
        </label>
      ) : (
        <legend className="text-textPrimary text-md flex gap-2 font-bold">
          {label}
          {isRequired && (
            <span className="font-medium text-error">必須</span>
          )}
        </legend>
      )}
      {renderInput({
        id,
        describedbyId,
        isDisabled,
        isInvalid,
        isRequired,
      })}
      {isInvalid && errorText ? (
        <p id={`${id}-feedback`} className="text-sm text-error">
          {errorText}
        </p>
      ) : (
        helpText && (
          <p
            id={`${id}-helptext`}
            className="text-textSecondary text-sm"
          >
            {helpText}
          </p>
        )
      )}
    </div>
  );
};
