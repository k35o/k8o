'use client';

import { Option, Select } from '@/app/_components/form/select/select';
import { TextField } from '@/app/_components/form/text-field';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { useMemo, useState } from 'react';
import { ColorTip } from './color-tip';

type ColorType = 'rgb' | 'hex';
type RGB = { r: string; g: string; b: string; a?: string };

const COLOR_TYPE_OPTIONS = [
  { value: 'hex', label: 'hex' },
  { value: 'rgb', label: 'rgb' },
] as const satisfies readonly Option[];

const rgbToHex = (rgb: RGB): string => {
  const { r, g, b, a } = rgb;
  return `${parseSafeRgb(r).toString(16)}${parseSafeRgb(g).toString(
    16
  )}${parseSafeRgb(b).toString(16)}${Math.round(
    parseSafeRgb(Number(a ? a : '1') * 255)
  ).toString(16)}`;
};

const parseSafeRgb = (number: number | string): number => {
  if (typeof number === 'string') {
    return parseSafeRgb(Number(number));
  }
  if (isNaN(number)) {
    return 255;
  }
  if (number < 0 || number > 255) {
    return 255;
  }
  return number;
};

const hexToRgb = (
  hex: string
): { r: number; g: number; b: number; a: number } => {
  if (hex.length === 3) {
    const r = parseInt(hex.slice(0, 1).repeat(2), 16);
    const g = parseInt(hex.slice(1, 2).repeat(2), 16);
    const b = parseInt(hex.slice(2, 3).repeat(2), 16);
    return {
      r: parseSafeRgb(r),
      g: parseSafeRgb(g),
      b: parseSafeRgb(b),
      a: 1,
    };
  }
  if (hex.length === 4) {
    const r = parseInt(hex.slice(0, 1).repeat(2), 16);
    const g = parseInt(hex.slice(1, 2).repeat(2), 16);
    const b = parseInt(hex.slice(2, 3).repeat(2), 16);
    const a = parseInt(hex.slice(3, 4).repeat(2), 16);
    return {
      r: parseSafeRgb(r),
      g: parseSafeRgb(g),
      b: parseSafeRgb(b),
      a: Math.round((parseSafeRgb(a) * 100) / 255) / 100,
    };
  }
  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return {
      r: parseSafeRgb(r),
      g: parseSafeRgb(g),
      b: parseSafeRgb(b),
      a: 1,
    };
  }
  if (hex.length === 8) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = parseInt(hex.slice(6, 8), 16);
    return {
      r: parseSafeRgb(r),
      g: parseSafeRgb(g),
      b: parseSafeRgb(b),
      a: Math.round((parseSafeRgb(a) * 100) / 255) / 100,
    };
  }
  return { r: 255, g: 255, b: 255, a: 1 };
};

export const ColorConverter = () => {
  const [colorTypeFrom, setColorTypeFrom] =
    useState<ColorType>('hex');
  const [colorTypeTo, setColorTypeTo] = useState<ColorType>('rgb');
  const [hexFrom, setHexFrom] = useState('ffffff');
  const [rgbFrom, setRgbFrom] = useState<RGB>({
    r: '255',
    g: '255',
    b: '255',
  });
  const handleChangeRgbFrom = (value: string, part: keyof RGB) => {
    setRgbFrom({ ...rgbFrom, [part]: value });
  };

  const handleChangeColorType = (
    colorType: string,
    setColorType: (base: ColorType) => void
  ) => {
    if (colorType === 'hex' || colorType === 'rgb') {
      setHexFrom('ffffff');
      setRgbFrom({ r: '255', g: '255', b: '255' });
      setColorType(colorType);
    }
  };

  const textTo: string = useMemo(() => {
    if (colorTypeFrom === 'hex') {
      if (colorTypeTo === 'hex') {
        return `#${hexFrom}`;
      }
      const rgb = hexToRgb(hexFrom);
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;
    } else {
      if (colorTypeTo === 'hex') {
        return `#${rgbToHex(rgbFrom)}`;
      }
      return `rgb(${parseSafeRgb(rgbFrom.r)}, ${parseSafeRgb(
        rgbFrom.g
      )}, ${parseSafeRgb(rgbFrom.b)}, ${parseSafeRgb(
        rgbFrom.a ?? '1'
      )})`;
    }
  }, [colorTypeFrom, colorTypeTo, hexFrom, rgbFrom]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-2">
        <Select
          value={colorTypeFrom.toString()}
          onChange={(value) =>
            handleChangeColorType(value, setColorTypeFrom)
          }
          options={COLOR_TYPE_OPTIONS}
        />
        <ArrowRightIcon className="h-8 w-8" aria-label="右矢印" />
        <Select
          value={colorTypeTo.toString()}
          onChange={(value) =>
            handleChangeColorType(value, setColorTypeTo)
          }
          options={COLOR_TYPE_OPTIONS}
        />
      </div>
      <div className="flex items-center gap-2">
        {colorTypeFrom === 'hex' ? (
          <div className="flex w-full items-center gap-2">
            #
            <TextField
              value={hexFrom}
              onChange={(from: string) => setHexFrom(from)}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            rgb(
            <TextField
              value={rgbFrom.r.toString()}
              onChange={(from: string) =>
                handleChangeRgbFrom(from, 'r')
              }
            />
            <TextField
              value={rgbFrom.g.toString()}
              onChange={(from: string) =>
                handleChangeRgbFrom(from, 'g')
              }
            />
            <TextField
              value={rgbFrom.b.toString()}
              onChange={(from: string) =>
                handleChangeRgbFrom(from, 'b')
              }
            />
            <TextField
              value={rgbFrom.a?.toString() ?? ''}
              onChange={(from: string) =>
                handleChangeRgbFrom(from, 'a')
              }
            />
            )
          </div>
        )}
      </div>
      <div className="flex items-center justify-center gap-2">
        <ColorTip color={textTo} />
        <p className="text-lg font-bold">{textTo}</p>
      </div>
    </div>
  );
};
