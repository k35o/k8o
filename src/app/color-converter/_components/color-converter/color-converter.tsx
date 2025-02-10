'use client';

import { TextField } from '@/components/form/text-field';
import {
  ChangeEventHandler,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { ColorTip } from './color-tip';
import {
  hexToHsl,
  hexToRgb,
  HSL,
  hslToHex,
  parseSafeHsl,
  parseSafeRgb,
  RGB,
  rgbToHex,
} from '../../_utils/color-converter';
import { FormControl } from '@/components/form/form-control';
import { NumberField } from '@/components/form/number-field';

type BaseColor =
  | {
      type: 'hex';
      value: string;
    }
  | {
      type: 'rgb';
      value: RGB;
    }
  | {
      type: 'hsl';
      value: HSL;
    };

export const ColorConverter = () => {
  const [baseColor, setBaseColor] = useState<BaseColor>({
    type: 'hex',
    value: '5eead4',
  });
  const hex = useMemo(() => {
    if (baseColor.type === 'hex') {
      return baseColor.value;
    }
    if (baseColor.type === 'rgb') {
      return rgbToHex(baseColor.value);
    }
    return hslToHex(baseColor.value);
  }, [baseColor]);

  const rgb = useMemo(() => {
    if (baseColor.type === 'rgb') {
      return baseColor.value;
    }
    if (baseColor.type === 'hsl') {
      return hexToRgb(hslToHex(baseColor.value));
    }
    return hexToRgb(baseColor.value);
  }, [baseColor]);

  const hsl = useMemo(() => {
    if (baseColor.type === 'hsl') {
      return baseColor.value;
    }
    if (baseColor.type === 'rgb') {
      return hexToHsl(rgbToHex(baseColor.value));
    }
    return hexToHsl(baseColor.value);
  }, [baseColor]);

  const handleChangeHex: ChangeEventHandler<HTMLInputElement> =
    useCallback((e) => {
      setBaseColor({
        type: 'hex',
        value: e.target.value,
      });
    }, []);

  const handleChangeRgb = useCallback(
    (value: number, type: keyof RGB) => {
      const newValue = parseSafeRgb(value);
      const newRgb = { ...rgb, [type]: newValue };
      setBaseColor({
        type: 'rgb',
        value: newRgb,
      });
    },
    [rgb],
  );

  const handleChangeHsl = useCallback(
    (value: number, type: keyof HSL) => {
      const newValue = parseSafeHsl(value, type);
      const newHsl = { ...hsl, [type]: newValue };
      setBaseColor({
        type: 'hsl',
        value: newHsl,
      });
    },
    [hsl],
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-center">
        <ColorTip color={`#${hex}`} />
      </div>
      <div className="flex flex-col items-center gap-6">
        <FormControl
          label="hex"
          renderInput={({ labelId: _, ...props }) => {
            return (
              <div className="flex w-full items-center gap-2">
                #
                <TextField
                  value={hex}
                  onChange={handleChangeHex}
                  {...props}
                />
              </div>
            );
          }}
        />
        <FormControl
          label="rgb"
          labelAs="legend"
          renderInput={(props) => {
            const { id, describedbyId, labelId: _, ...rest } = props;
            return (
              <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                <span className="sr-only sm:not-sr-only">rgb(</span>
                <label
                  htmlFor={id}
                  className="not-sr-only text-sm font-bold sm:sr-only"
                >
                  Red
                </label>
                <NumberField
                  id={id}
                  describedbyId={describedbyId}
                  value={rgb.r}
                  onChange={(red) => {
                    handleChangeRgb(red, 'r');
                  }}
                  max={255}
                  min={0}
                  {...rest}
                />
                <span className="sr-only sm:not-sr-only">,</span>
                <label
                  htmlFor={`${id}-rgb-green`}
                  className="not-sr-only text-sm font-bold sm:sr-only"
                >
                  Green
                </label>
                <NumberField
                  id={`${id}-rgb-green`}
                  value={rgb.g}
                  onChange={(green) => {
                    handleChangeRgb(green, 'g');
                  }}
                  max={255}
                  min={0}
                  {...rest}
                />
                <span className="sr-only sm:not-sr-only">,</span>
                <label
                  htmlFor={`${id}-rgb-blue`}
                  className="not-sr-only text-sm font-bold sm:sr-only"
                >
                  Blue
                </label>
                <NumberField
                  id={`${id}-rgb-blue`}
                  value={rgb.b}
                  onChange={(blue) => {
                    handleChangeRgb(blue, 'b');
                  }}
                  max={255}
                  min={0}
                  {...rest}
                />
                <span className="sr-only sm:not-sr-only">/</span>
                <label
                  htmlFor={`${id}-rgb-alpha`}
                  className="not-sr-only text-sm font-bold sm:sr-only"
                >
                  Alpha
                </label>
                <NumberField
                  id={`${id}-rgb-alpha`}
                  value={rgb.a ?? 1}
                  onChange={(alpha) => {
                    handleChangeRgb(alpha, 'a');
                  }}
                  max={1}
                  min={0}
                  step={0.01}
                  precision={2}
                  {...rest}
                />
                <span className="sr-only sm:not-sr-only">)</span>
              </div>
            );
          }}
        />
        <FormControl
          label="hsl"
          labelAs="legend"
          renderInput={(props) => {
            const { id, describedbyId, labelId: _, ...rest } = props;
            return (
              <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                <span className="sr-only sm:not-sr-only">hsl(</span>
                <label
                  htmlFor={id}
                  className="not-sr-only text-sm font-bold sm:sr-only"
                >
                  Hue
                </label>
                <NumberField
                  id={id}
                  describedbyId={describedbyId}
                  value={hsl.h}
                  onChange={(hue) => {
                    handleChangeHsl(hue, 'h');
                  }}
                  max={360}
                  min={0}
                  {...rest}
                />
                <span className="sr-only sm:not-sr-only">,</span>
                <label
                  htmlFor={`${id}-hsl-saturation`}
                  className="not-sr-only text-sm font-bold sm:sr-only"
                >
                  Saturation
                </label>
                <NumberField
                  id={`${id}-hsl-saturation`}
                  value={hsl.s}
                  onChange={(saturation) => {
                    handleChangeHsl(saturation, 's');
                  }}
                  max={100}
                  min={0}
                  {...rest}
                />
                <span className="sr-only sm:not-sr-only">,</span>
                <label
                  htmlFor={`${id}-hsl-lightness`}
                  className="not-sr-only text-sm font-bold sm:sr-only"
                >
                  Lightness
                </label>
                <NumberField
                  id={`${id}-hsl-lightness`}
                  value={hsl.l}
                  onChange={(lightness) => {
                    handleChangeHsl(lightness, 'l');
                  }}
                  max={100}
                  min={0}
                  {...rest}
                />
                <span className="sr-only sm:not-sr-only">/</span>
                <label
                  htmlFor={`${id}-hsl-alpha`}
                  className="not-sr-only text-sm font-bold sm:sr-only"
                >
                  Alpha
                </label>
                <NumberField
                  id={`${id}-hsl-alpha`}
                  value={hsl.a ?? 1}
                  onChange={(alpha) => {
                    handleChangeHsl(alpha, 'a');
                  }}
                  max={1}
                  min={0}
                  step={0.01}
                  precision={2}
                  {...rest}
                />
                <span className="sr-only sm:not-sr-only">)</span>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};
