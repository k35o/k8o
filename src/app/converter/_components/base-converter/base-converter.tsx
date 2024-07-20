'use client';

import { FormControl } from '@/components/form/form-control/form-control';
import { Option, Select } from '@/components/form/select/select';
import { TextField } from '@/components/form/text-field';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { useId, useMemo, useState } from 'react';

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
  const id = useId();
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
          renderInput={({ describedbyId, ...props }) => {
            return (
              <Select
                describedbyId={describedbyId}
                value={baseFrom.toString()}
                onChange={(value) =>
                  handleChangeBase(value, setBaseFrom)
                }
                options={BASE_OPTIONS}
                {...props}
              />
            );
          }}
        />
        <ArrowRightIcon
          className="size-10 stroke-2"
          aria-label="右矢印"
        />
        <FormControl
          label="変換後"
          renderInput={({ describedbyId, ...props }) => {
            return (
              <Select
                describedbyId={describedbyId}
                value={baseTo.toString()}
                onChange={(value) =>
                  handleChangeBase(value, setBaseTo)
                }
                options={BASE_OPTIONS}
                {...props}
              />
            );
          }}
        />
      </div>
      <fieldset className="flex w-full flex-col gap-2">
        <label className="font-bold" htmlFor={id}>
          変換する値
        </label>
        <TextField
          id={id}
          value={textFrom}
          onChange={(textFrom: string) => setTextFrom(textFrom)}
        />
      </fieldset>
      <p className="text-center text-xl font-bold">{textTo}</p>
    </div>
  );
};
