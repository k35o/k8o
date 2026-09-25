'use client';

import { Code, FormControl, Select, TextField } from '@k8ordo/ui';
import { useEffect, useRef, useState } from 'react';

const valueOptions = [
  { value: 'unset', label: '属性なし' },
  { value: 'on', label: 'autocorrect="on"' },
  { value: 'off', label: 'autocorrect="off"' },
  { value: '', label: 'autocorrect=""（空文字列）' },
  { value: 'yes', label: 'autocorrect="yes"（未定義の値）' },
] as const;

type ValueOption = (typeof valueOptions)[number]['value'];

const isValueOption = (value: string): value is ValueOption =>
  valueOptions.some((option) => option.value === value);

// 型定義にまだ autocorrect が無いので、対応ブラウザでだけ読む
const readAutocorrect = (element: HTMLElement): boolean | null =>
  'autocorrect' in element && typeof element.autocorrect === 'boolean'
    ? element.autocorrect
    : null;

export function AttributeReflectionDemo() {
  const [value, setValue] = useState<ValueOption>('unset');
  const [reflected, setReflected] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (input === null) return;
    if (value === 'unset') {
      input.removeAttribute('autocorrect');
    } else {
      input.setAttribute('autocorrect', value);
    }
    setReflected(readAutocorrect(input));
  }, [value]);

  return (
    <div className="flex flex-col gap-6">
      <FormControl
        label="autocorrect属性の値"
        renderInput={({ 'aria-labelledby': _ariaLabelledby, ...props }) => (
          <Select
            {...props}
            onChange={(e) => {
              if (isValueOption(e.currentTarget.value)) {
                setValue(e.currentTarget.value);
              }
            }}
            options={valueOptions}
            value={value}
          />
        )}
      />

      <FormControl
        helpText="iOSのSafariやAndroidでは、teh と打ってスペースを入れると the に置き換わります。macOSのSafariは編集メニューのスペルと文法でスペルを自動修正が有効なときだけ置き換わり、デスクトップのChromeとFirefoxは置き換えを行いません"
        label="ユーザー名"
        renderInput={({ 'aria-labelledby': _ariaLabelledby, ...props }) => (
          <TextField {...props} ref={inputRef} />
        )}
      />

      <p className="text-fg-base text-sm">
        <Code>input.autocorrect</Code>の値:{' '}
        <span className="font-mono font-bold">
          {reflected === null
            ? '未対応（プロパティが無い）'
            : String(reflected)}
        </span>
      </p>

      <p className="text-fg-mute text-sm">
        属性の文字列ではなく真偽値が返ります。
        <Code>off</Code>のときだけ<Code>false</Code>で、空文字列や未定義の値は
        <Code>on</Code>と同じ<Code>true</Code>になります。
      </p>
    </div>
  );
}
