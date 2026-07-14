'use client';

import { FormControl, TextField } from '@k8o/arte-odyssey';
import { parseColor } from '@repo/helpers/color/parse';
import type { Color } from '@repo/helpers/color/spaces';
import { useState } from 'react';
import type { ChangeEventHandler, FC } from 'react';

type Props = {
  onColorChange: (color: Color) => void;
};

export const BaseColorInput: FC<Props> = ({ onColorChange }) => {
  const [draft, setDraft] = useState('');
  const [invalid, setInvalid] = useState(false);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { value } = e.target;
    setDraft(value);

    if (value.trim() === '') {
      setInvalid(false);
      return;
    }
    const parsed = parseColor(value);
    if (parsed === null) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    onColorChange(parsed);
  };

  return (
    <FormControl
      errorText={invalid ? '認識できない色形式です' : undefined}
      helpText="色を貼り付けると色相とピーク彩度に取り込みます（およそ500段に相当）"
      invalid={invalid}
      label="基準色から取り込む"
      renderInput={(props) => (
        <TextField
          {...props}
          autoComplete="off"
          onChange={handleChange}
          placeholder="#5eead4, oklch(0.85 0.13 178), teal ..."
          spellCheck={false}
          value={draft}
        />
      )}
    />
  );
};
