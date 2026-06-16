import { FormControl, TextField } from '@k8o/arte-odyssey';
import type { FC } from 'react';

type LabeledTextFieldProps = {
  label: string;
  name: string;
  placeholder: string;
  defaultValue: string;
  required?: boolean;
};

// FormControl + TextField の定型（renderInput で aria を引き回す）を集約。
// 各 admin フォームの単純なテキスト入力で共用する。
export const LabeledTextField: FC<LabeledTextFieldProps> = ({
  label,
  name,
  placeholder,
  defaultValue,
  required = false,
}) => (
  <FormControl
    label={label}
    required={required}
    renderInput={({ 'aria-labelledby': _, ...props }) => (
      <TextField
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
        {...props}
      />
    )}
  />
);
