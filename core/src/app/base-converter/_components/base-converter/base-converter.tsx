'use client';

import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { TextField } from '@k8o/arte-odyssey/form/text-field';
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

export const BaseConverter = () => {
  const [invalid, setInvalid] = useState<{
    target: Base;
    message: string;
  } | null>(null);
  const [binary, setBinary] = useState('');
  const [octal, setOctal] = useState('');
  const [decimal, setDecimal] = useState('');
  const [hexadecimal, setHexadecimal] = useState('');

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

  return (
    <>
      <FormControl
        errorText={invalid?.message ?? undefined}
        isInvalid={invalid?.target === 2}
        label="2進数"
        renderInput={({ labelId: _, ...props }) => {
          return (
            <TextField
              onChange={(e) => {
                handleChange(e.target.value, 2);
              }}
              value={binary}
              {...props}
            />
          );
        }}
      />
      <FormControl
        errorText={invalid?.message ?? undefined}
        isInvalid={invalid?.target === 8}
        label="8進数"
        renderInput={({ labelId: _, ...props }) => {
          return (
            <TextField
              onChange={(e) => {
                handleChange(e.target.value, 8);
              }}
              value={octal}
              {...props}
            />
          );
        }}
      />
      <FormControl
        errorText={invalid?.message ?? undefined}
        isInvalid={invalid?.target === 10}
        label="10進数"
        renderInput={({ labelId: _, ...props }) => {
          return (
            <TextField
              onChange={(e) => {
                handleChange(e.target.value, 10);
              }}
              value={decimal}
              {...props}
            />
          );
        }}
      />
      <FormControl
        errorText={invalid?.message ?? undefined}
        isInvalid={invalid?.target === 16}
        label="16進数"
        renderInput={({ labelId: _, ...props }) => {
          return (
            <TextField
              onChange={(e) => {
                handleChange(e.target.value, 16);
              }}
              value={hexadecimal}
              {...props}
            />
          );
        }}
      />
    </>
  );
};
