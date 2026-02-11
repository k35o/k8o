'use client';

import { Card } from '@k8o/arte-odyssey/card';
import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { TextField } from '@k8o/arte-odyssey/form/text-field';
import { useClipboard } from '@k8o/arte-odyssey/hooks/clipboard';
import { IconButton } from '@k8o/arte-odyssey/icon-button';
import { CopyIcon } from '@k8o/arte-odyssey/icons';
import { useToast } from '@k8o/arte-odyssey/toast';
import { useCallback, useState } from 'react';

type Base = 2 | 8 | 10 | 16;

const convertNumber = (
  number: string,
  baseFrom: Base,
  baseTo: Base,
): string => {
  if (baseFrom === baseTo) return number;

  return Number.parseInt(number, baseFrom).toString(baseTo);
};

const BASES = [
  {
    base: 2 as const,
    label: '2進数',
    borderColor: 'border-group-primary',
  },
  {
    base: 8 as const,
    label: '8進数',
    borderColor: 'border-group-secondary',
  },
  {
    base: 10 as const,
    label: '10進数',
    borderColor: 'border-group-tertiary',
  },
  {
    base: 16 as const,
    label: '16進数',
    borderColor: 'border-group-quaternary',
  },
];

export const BaseConverter = () => {
  const [invalid, setInvalid] = useState<{
    target: Base;
    message: string;
  } | null>(null);
  const [binary, setBinary] = useState('');
  const [octal, setOctal] = useState('');
  const [decimal, setDecimal] = useState('');
  const [hexadecimal, setHexadecimal] = useState('');
  const { writeClipboard } = useClipboard();
  const { onOpen } = useToast();

  const handleChange = useCallback((value: string, base: Base) => {
    setInvalid(null);
    if (value === '') {
      setBinary('');
      setOctal('');
      setDecimal('');
      setHexadecimal('');
      return;
    }
    switch (base) {
      case 2:
        setBinary(value);
        if (!/^[01]+$/.test(value)) {
          setInvalid({
            target: 2,
            message: '2進数は0または1で入力してください',
          });
          return;
        }
        setOctal(convertNumber(value, 2, 8));
        setDecimal(convertNumber(value, 2, 10));
        setHexadecimal(convertNumber(value, 2, 16));
        break;
      case 8:
        setOctal(value);
        if (!/^[0-7]+$/.test(value)) {
          setInvalid({
            target: 8,
            message: '8進数は0から7で入力してください',
          });
          return;
        }
        setBinary(convertNumber(value, 8, 2));
        setDecimal(convertNumber(value, 8, 10));
        setHexadecimal(convertNumber(value, 8, 16));
        break;
      case 10:
        setDecimal(value);
        if (!/^\d+$/.test(value)) {
          setInvalid({
            target: 10,
            message: '10進数は0から9で入力してください',
          });
          return;
        }
        setBinary(convertNumber(value, 10, 2));
        setOctal(convertNumber(value, 10, 8));
        setHexadecimal(convertNumber(value, 10, 16));
        break;
      case 16:
        setHexadecimal(value);
        if (!/^[0-9a-fA-F]+$/.test(value)) {
          setInvalid({
            target: 16,
            message: '16進数は0から9またはaからfで入力してください',
          });
          return;
        }
        setBinary(convertNumber(value, 16, 2));
        setOctal(convertNumber(value, 16, 8));
        setDecimal(convertNumber(value, 16, 10));
        break;
    }
  }, []);

  const handleCopy = (value: string, label: string) => {
    if (!value) return;
    void writeClipboard(value).then(() => {
      onOpen('success', `${label}をコピーしました`);
    });
  };

  const values: Record<Base, string> = {
    2: binary,
    8: octal,
    10: decimal,
    16: hexadecimal,
  };

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {BASES.map(({ base, label, borderColor }) => (
        <Card key={base}>
          <div className={`border-l-4 px-4 py-3 ${borderColor}`}>
            <FormControl
              errorText={invalid?.message ?? undefined}
              isInvalid={invalid?.target === base}
              label={label}
              renderInput={({ labelId: _, ...props }) => (
                <div className="flex items-center gap-2">
                  <TextField
                    onChange={(e) => {
                      handleChange(e.target.value, base);
                    }}
                    value={values[base]}
                    {...props}
                  />
                  <IconButton
                    bg="base"
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
