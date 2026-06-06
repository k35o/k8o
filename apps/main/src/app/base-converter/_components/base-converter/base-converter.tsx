'use client';

import {
  Card,
  CopyIcon,
  FormControl,
  IconButton,
  TextField,
  useClipboard,
  useToast,
} from '@k8o/arte-odyssey';
import { useState } from 'react';

type Base = 2 | 8 | 10 | 16;

const BASES = [
  { base: 2, label: '2進数' },
  { base: 8, label: '8進数' },
  { base: 10, label: '10進数' },
  { base: 16, label: '16進数' },
] as const satisfies Array<{ base: Base; label: string }>;

const VALIDATORS: Record<Base, RegExp> = {
  2: /^[01]+$/u,
  8: /^[0-7]+$/u,
  10: /^\d+$/u,
  16: /^[0-9a-fA-F]+$/u,
};

const ERROR_MESSAGES: Record<Base, string> = {
  2: '2進数は0または1で入力してください',
  8: '8進数は0から7で入力してください',
  10: '10進数は0から9で入力してください',
  16: '16進数は0から9またはaからfで入力してください',
};

const EMPTY_VALUES: Record<Base, string> = { 2: '', 8: '', 10: '', 16: '' };

const convertFrom = (value: string, base: Base): Record<Base, string> => ({
  2: base === 2 ? value : Number.parseInt(value, base).toString(2),
  8: base === 8 ? value : Number.parseInt(value, base).toString(8),
  10: base === 10 ? value : Number.parseInt(value, base).toString(10),
  16: base === 16 ? value : Number.parseInt(value, base).toString(16),
});

export const BaseConverter = () => {
  const [values, setValues] = useState<Record<Base, string>>(EMPTY_VALUES);
  const [invalid, setInvalid] = useState<{
    target: Base;
    message: string;
  } | null>(null);
  const { writeClipboard } = useClipboard();
  const { onOpen } = useToast();

  const handleChange = (value: string, base: Base) => {
    if (value === '') {
      setValues(EMPTY_VALUES);
      setInvalid(null);
      return;
    }
    if (!VALIDATORS[base].test(value)) {
      setValues((prev) => ({ ...prev, [base]: value }));
      setInvalid({ target: base, message: ERROR_MESSAGES[base] });
      return;
    }
    setValues(convertFrom(value, base));
    setInvalid(null);
  };

  const handleCopy = (value: string, label: string) => {
    if (!value) return;
    void writeClipboard(value).then(() => {
      onOpen('success', `${label}をコピーしました`);
      return undefined;
    });
  };

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {BASES.map(({ base, label }) => (
        <Card key={base}>
          <div className="px-4 py-3">
            <FormControl
              errorText={invalid?.message ?? undefined}
              invalid={invalid?.target === base}
              label={label}
              renderInput={({ 'aria-labelledby': _, ...props }) => (
                <div className="flex items-center gap-2">
                  <TextField
                    onChange={(e) => {
                      handleChange(e.target.value, base);
                    }}
                    value={values[base]}
                    {...props}
                  />
                  <IconButton
                    color="base"
                    label={`${label}をコピー`}
                    onClick={() => {
                      handleCopy(values[base], label);
                    }}
                  >
                    <CopyIcon />
                  </IconButton>
                </div>
              )}
            />
          </div>
        </Card>
      ))}
    </div>
  );
};
