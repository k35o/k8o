'use client';

import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { NumberField } from '@k8o/arte-odyssey/form/number-field';
import { TextField } from '@k8o/arte-odyssey/form/text-field';
import { type ChangeEventHandler, useCallback, useMemo, useState } from 'react';
import {
  type HSL,
  hexToHsl,
  hexToRgb,
  hslToHex,
  parseSafeHsl,
  parseSafeRgb,
  type RGB,
  rgbToHex,
} from '../../_utils/color-converter';
import { ColorTip } from './color-tip';

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

  const handleChangeHex: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      setBaseColor({
        type: 'hex',
        value: e.target.value,
      });
    },
    [],
  );

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
      <div className="wrap-normal flex flex-col items-center gap-6">
        <FormControl
          label="hex"
          renderInput={({ labelId: _, ...props }) => {
            return (
              <div className="flex w-full items-center gap-2">
                #
                <TextField onChange={handleChangeHex} value={hex} {...props} />
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
                  className="not-sr-only font-bold text-sm sm:sr-only"
                  htmlFor={id}
                >
                  Red
                </label>
                <NumberField
                  describedbyId={describedbyId}
                  id={id}
                  max={255}
                  min={0}
                  onChange={(red) => {
                    handleChangeRgb(red, 'r');
                  }}
                  value={rgb.r}
                  {...rest}
                />
                <span className="sr-only sm:not-sr-only">,</span>
                <label
                  className="not-sr-only font-bold text-sm sm:sr-only"
                  htmlFor={`${id}-rgb-green`}
                >
                  Green
                </label>
                <NumberField
                  id={`${id}-rgb-green`}
                  max={255}
                  min={0}
                  onChange={(green) => {
                    handleChangeRgb(green, 'g');
                  }}
                  value={rgb.g}
                  {...rest}
                />
                <span className="sr-only sm:not-sr-only">,</span>
                <label
                  className="not-sr-only font-bold text-sm sm:sr-only"
                  htmlFor={`${id}-rgb-blue`}
                >
                  Blue
                </label>
                <NumberField
                  id={`${id}-rgb-blue`}
                  max={255}
                  min={0}
                  onChange={(blue) => {
                    handleChangeRgb(blue, 'b');
                  }}
                  value={rgb.b}
                  {...rest}
                />
                <span className="sr-only sm:not-sr-only">/</span>
                <label
                  className="not-sr-only font-bold text-sm sm:sr-only"
                  htmlFor={`${id}-rgb-alpha`}
                >
                  Alpha
                </label>
                <NumberField
                  id={`${id}-rgb-alpha`}
                  max={1}
                  min={0}
                  onChange={(alpha) => {
                    handleChangeRgb(alpha, 'a');
                  }}
                  precision={2}
                  step={0.01}
                  value={rgb.a ?? 1}
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
                  className="not-sr-only font-bold text-sm sm:sr-only"
                  htmlFor={id}
                >
                  Hue
                </label>
                <NumberField
                  describedbyId={describedbyId}
                  id={id}
                  max={360}
                  min={0}
                  onChange={(hue) => {
                    handleChangeHsl(hue, 'h');
                  }}
                  value={hsl.h}
                  {...rest}
                />
                <span className="sr-only sm:not-sr-only">,</span>
                <label
                  className="not-sr-only font-bold text-sm sm:sr-only"
                  htmlFor={`${id}-hsl-saturation`}
                >
                  Saturation
                </label>
                <NumberField
                  id={`${id}-hsl-saturation`}
                  max={100}
                  min={0}
                  onChange={(saturation) => {
                    handleChangeHsl(saturation, 's');
                  }}
                  value={hsl.s}
                  {...rest}
                />
                <span className="sr-only sm:not-sr-only">,</span>
                <label
                  className="not-sr-only font-bold text-sm sm:sr-only"
                  htmlFor={`${id}-hsl-lightness`}
                >
                  Lightness
                </label>
                <NumberField
                  id={`${id}-hsl-lightness`}
                  max={100}
                  min={0}
                  onChange={(lightness) => {
                    handleChangeHsl(lightness, 'l');
                  }}
                  value={hsl.l}
                  {...rest}
                />
                <span className="sr-only sm:not-sr-only">/</span>
                <label
                  className="not-sr-only font-bold text-sm sm:sr-only"
                  htmlFor={`${id}-hsl-alpha`}
                >
                  Alpha
                </label>
                <NumberField
                  id={`${id}-hsl-alpha`}
                  max={1}
                  min={0}
                  onChange={(alpha) => {
                    handleChangeHsl(alpha, 'a');
                  }}
                  precision={2}
                  step={0.01}
                  value={hsl.a ?? 1}
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
