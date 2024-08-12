'use client';

import { Option, Select } from '@/components/form/select/select';
import { TextField } from '@/components/form/text-field';
import { useMemo, useState } from 'react';
import { ColorTip } from './color-tip';
import {
  hexToRgb,
  parseSafeRgb,
  RGB,
  rgbToHex,
} from '../../_utils/color-converter';
import { FormControl } from '@/components/form/form-control';
import { ArrowBigRightDash } from 'lucide-react';

type ColorType = 'rgb' | 'hex';

const COLOR_TYPE_OPTIONS = [
  { value: 'hex', label: 'hex' },
  { value: 'rgb', label: 'rgb' },
] as const satisfies readonly Option[];

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
        <FormControl
          label="変換前"
          renderInput={({ describedbyId, ...props }) => {
            return (
              <Select
                describedbyId={describedbyId}
                value={colorTypeFrom.toString()}
                onChange={(value) =>
                  handleChangeColorType(value, setColorTypeFrom)
                }
                options={COLOR_TYPE_OPTIONS}
                {...props}
              />
            );
          }}
        />
        <ArrowBigRightDash aria-label="右矢印" className="size-14" />
        <FormControl
          label="変換後"
          renderInput={({ describedbyId, ...props }) => {
            return (
              <Select
                describedbyId={describedbyId}
                value={colorTypeTo.toString()}
                onChange={(value) =>
                  handleChangeColorType(value, setColorTypeTo)
                }
                options={COLOR_TYPE_OPTIONS}
                {...props}
              />
            );
          }}
        />
      </div>
      <div className="flex items-center gap-2">
        <FormControl
          label="変換する値"
          renderInput={(props) => {
            if (colorTypeFrom === 'hex') {
              return (
                <div className="flex w-full items-center gap-2">
                  #
                  <TextField
                    value={hexFrom}
                    onChange={(from: string) => setHexFrom(from)}
                    {...props}
                  />
                </div>
              );
            }
            const { id, describedbyId, ...rest } = props;
            return (
              <div className="flex items-center gap-2">
                rgb(
                <TextField
                  id={id}
                  describedbyId={describedbyId}
                  value={rgbFrom.r.toString()}
                  onChange={(from: string) =>
                    handleChangeRgbFrom(from, 'r')
                  }
                  {...rest}
                />
                <TextField
                  value={rgbFrom.g.toString()}
                  onChange={(from: string) =>
                    handleChangeRgbFrom(from, 'g')
                  }
                  {...rest}
                />
                <TextField
                  value={rgbFrom.b.toString()}
                  onChange={(from: string) =>
                    handleChangeRgbFrom(from, 'b')
                  }
                  {...rest}
                />
                <TextField
                  value={rgbFrom.a?.toString() ?? ''}
                  onChange={(from: string) =>
                    handleChangeRgbFrom(from, 'a')
                  }
                  {...rest}
                />
                )
              </div>
            );
          }}
        />
      </div>
      <div className="flex items-center justify-center gap-2">
        <ColorTip color={textTo} />
        <p className="text-lg font-bold">{textTo}</p>
      </div>
    </div>
  );
};
