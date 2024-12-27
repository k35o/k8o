'use client';

import { FormControl } from '@/components/form/form-control';
import { Option, Select } from '@/components/form/select/select';
import { TextField } from '@/components/form/text-field';
import { ArrowBigRightDash } from 'lucide-react';
import { useMemo, useState } from 'react';

type Base = 2 | 8 | 10 | 16;

const BASE_OPTIONS = [
  { value: '2', label: '2進数' },
  { value: '8', label: '8進数' },
  { value: '10', label: '10進数' },
  { value: '16', label: '16進数' },
] as const satisfies readonly Option[];

const isBaseNumber = (number: number): Base => {
  switch (number) {
    case 2:
    case 8:
    case 10:
    case 16:
      return number;
    default:
      throw new Error('Invalid base number');
  }
};

const convertNumber = (
  number: string,
  baseFrom: Base,
  baseTo: Base,
): string => {
  if (baseFrom === baseTo) return number;

  return parseInt(number, baseFrom).toString(baseTo);
};

export const BaseConverter = () => {
  const [baseFrom, setBaseFrom] = useState<Base>(10);
  const [baseTo, setBaseTo] = useState<Base>(10);
  const handleChangeBase = (
    base: string,
    setBase: (base: Base) => void,
  ) => {
    const parsedValue = isNaN(Number(base)) ? 2 : Number(base);
    setBase(isBaseNumber(parsedValue));
  };

  const [textFrom, setTextFrom] = useState('');
  const textTo: string = useMemo(() => {
    const convertedNumber = convertNumber(textFrom, baseFrom, baseTo);
    if (!convertedNumber || convertedNumber === 'NaN') {
      return '0';
    }
    return convertedNumber;
  }, [textFrom, baseFrom, baseTo]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-3">
        <FormControl
          label="変換前"
          renderInput={(props) => {
            return (
              <Select
                value={baseFrom.toString()}
                onChange={(value) => {
                  handleChangeBase(value, setBaseFrom);
                }}
                options={BASE_OPTIONS}
                {...props}
              />
            );
          }}
        />
        <ArrowBigRightDash aria-label="右矢印" className="size-14" />
        <FormControl
          label="変換後"
          renderInput={(props) => {
            return (
              <Select
                value={baseTo.toString()}
                onChange={(value) => {
                  handleChangeBase(value, setBaseTo);
                }}
                options={BASE_OPTIONS}
                {...props}
              />
            );
          }}
        />
      </div>
      <FormControl
        label="変換する値"
        renderInput={(props) => {
          return (
            <TextField
              value={textFrom}
              onChange={(textFrom: string) => {
                setTextFrom(textFrom);
              }}
              {...props}
            />
          );
        }}
      />
      <p className="text-center text-xl font-bold">{textTo}</p>
    </div>
  );
};
