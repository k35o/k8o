'use client';

import { FormControl } from '@/components/form/form-control';
import { TextField } from '@/components/form/text-field';
import { useCallback, useState } from 'react';

type Base = 2 | 8 | 10 | 16;

const convertNumber = (
  number: string,
  baseFrom: Base,
  baseTo: Base,
): string => {
  if (baseFrom === baseTo) return number;

  return parseInt(number, baseFrom).toString(baseTo);
};

export const BaseConverter = () => {
  const [invalid, setInvalid] = useState<{
    target: Base;
    message: string;
  } | null>(null);
  const [binary, setBinary] = useState('0');
  const [octal, setOctal] = useState('0');
  const [decimal, setDecimal] = useState('0');
  const [hexadecimal, setHexadecimal] = useState('0');

  const handleChange = useCallback((value: string, base: Base) => {
    setInvalid(null);
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

  return (
    <div className="flex flex-col gap-4">
      <FormControl
        label="2進数"
        isInvalid={invalid?.target === 2}
        errorText={invalid?.message ?? undefined}
        renderInput={({ labelId: _, ...props }) => {
          return (
            <TextField
              value={binary}
              onChange={(text: string) => {
                handleChange(text, 2);
              }}
              {...props}
            />
          );
        }}
      />
      <FormControl
        label="8進数"
        isInvalid={invalid?.target === 8}
        errorText={invalid?.message ?? undefined}
        renderInput={({ labelId: _, ...props }) => {
          return (
            <TextField
              value={octal}
              onChange={(text: string) => {
                handleChange(text, 8);
              }}
              {...props}
            />
          );
        }}
      />
      <FormControl
        label="10進数"
        isInvalid={invalid?.target === 10}
        errorText={invalid?.message ?? undefined}
        renderInput={({ labelId: _, ...props }) => {
          return (
            <TextField
              value={decimal}
              onChange={(text: string) => {
                handleChange(text, 10);
              }}
              {...props}
            />
          );
        }}
      />
      <FormControl
        label="16進数"
        isInvalid={invalid?.target === 16}
        errorText={invalid?.message ?? undefined}
        renderInput={({ labelId: _, ...props }) => {
          return (
            <TextField
              value={hexadecimal}
              onChange={(text: string) => {
                handleChange(text, 16);
              }}
              {...props}
            />
          );
        }}
      />
    </div>
  );
};
