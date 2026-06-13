'use client';

import { FormControl, TextField } from '@k8o/arte-odyssey';
import { formatHex } from '@repo/helpers/color/format';
import { parseColor } from '@repo/helpers/color/parse';
import type { Color } from '@repo/helpers/color/spaces';
import { type ChangeEventHandler, type FC, useRef, useState } from 'react';

type Props = {
  color: Color;
  onColorChange: (color: Color) => void;
};

// あらゆる CSS 色形式を貼り付け・入力できる統一入力。
// 妥当な色のときだけ親へ反映し、未完成・不正な入力では直前の有効色を保つ。
export const SmartInput: FC<Props> = ({ color, onColorChange }) => {
  const [draft, setDraft] = useState(() => formatHex(color));
  const [prevColor, setPrevColor] = useState(color);
  const [invalid, setInvalid] = useState(false);
  // 自分が emit した色変更（入力途中）と、外部（スライダー等）の変更を区別する。
  const emitted = useRef<Color | null>(null);

  // 外部からの色変更時だけ入力欄へ反映する（入力途中の文字列は上書きしない）。
  if (color !== prevColor) {
    setPrevColor(color);
    if (color !== emitted.current) {
      setDraft(formatHex(color));
      setInvalid(false);
    }
  }

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
    emitted.current = parsed;
    onColorChange(parsed);
  };

  return (
    <FormControl
      errorText={invalid ? '認識できない色形式です' : undefined}
      helpText="HEX / RGB / HSL / HWB / OKLCH / OKLAB / LCH / LAB / 色名 を貼り付けできます"
      invalid={invalid}
      label="カラーコード"
      renderInput={(props) => (
        <TextField
          {...props}
          autoComplete="off"
          onChange={handleChange}
          placeholder="#5eead4, rgb(94 234 212), oklch(0.85 0.13 178), teal ..."
          spellCheck={false}
          value={draft}
        />
      )}
    />
  );
};
