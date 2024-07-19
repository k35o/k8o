'use client';

import { Option, Select } from '@/components/form/select/select';
import { TextField } from '@/components/form/text-field';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { useId, useMemo, useState } from 'react';
import { ColorTip } from './color-tip';
import {
  hexToRgb,
  parseSafeRgb,
  RGB,
  rgbToHex,
} from '../../_utils/color-converter';

type ColorType = 'rgb' | 'hex';

const COLOR_TYPE_OPTIONS = [
  { value: 'hex', label: 'hex' },
  { value: 'rgb', label: 'rgb' },
] as const satisfies readonly Option[];

export const ColorConverter = () => {
  const id = useId();
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
    setColorType: (base: ColorType) => void,
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
        rgbFrom.g,
      )}, ${parseSafeRgb(rgbFrom.b)}, ${parseSafeRgb(
        rgbFrom.a ?? '1',
      )})`;
    }
  }, [colorTypeFrom, colorTypeTo, hexFrom, rgbFrom]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-3">
        <fieldset className="flex w-full flex-col gap-2">
          <label className="font-bold" htmlFor={`${id}-form`}>
            変換前
          </label>
          <Select
            id={`${id}-form`}
            value={colorTypeFrom.toString()}
            onChange={(value) =>
              handleChangeColorType(value, setColorTypeFrom)
            }
            options={COLOR_TYPE_OPTIONS}
          />
        </fieldset>
        <ArrowRightIcon
          className="size-10 stroke-2"
          aria-label="右矢印"
        />
        <fieldset className="flex w-full flex-col gap-2">
          <label className="font-bold" htmlFor={`${id}-to`}>
            変換後
          </label>
          <Select
            id={`${id}-to`}
            value={colorTypeTo.toString()}
            onChange={(value) =>
              handleChangeColorType(value, setColorTypeTo)
            }
            options={COLOR_TYPE_OPTIONS}
          />
        </fieldset>
      </div>
      <div className="flex items-center gap-2">
        <fieldset className="flex w-full flex-col gap-2">
          <label className="font-bold" htmlFor={id}>
            変換する値
          </label>
          {colorTypeFrom === 'hex' ? (
            <div className="flex w-full items-center gap-2">
              #
              <TextField
                id={id}
                value={hexFrom}
                onChange={(from: string) => setHexFrom(from)}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              rgb(
              <TextField
                id={id}
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
        </fieldset>
      </div>
      <div className="flex items-center justify-center gap-2">
        <ColorTip color={textTo} />
        <p className="text-lg font-bold">{textTo}</p>
      </div>
    </div>
  );
};
