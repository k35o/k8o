'use client';

import { TextField } from '@/components/form/text-field';
import { useCallback, useMemo, useState } from 'react';
import { ColorTip } from './color-tip';
import {
  hexToRgb,
  parseSafeRgb,
  RGB,
  rgbToHex,
} from '../../_utils/color-converter';
import { FormControl } from '@/components/form/form-control';
import { NumberField } from '@/components/form/number-field';

export const ColorConverter = () => {
  const [baseColor, setBaseColor] = useState('50e2d2');
  const rgb = useMemo(() => hexToRgb(baseColor), [baseColor]);

  const handleChangeRgb = useCallback(
    (value: number, type: keyof RGB) => {
      const newValue = parseSafeRgb(value);
      const newRgb = { ...rgb, [type]: newValue };
      setBaseColor(rgbToHex(newRgb));
    },
    [rgb],
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-center">
        <ColorTip color={`#${baseColor}`} />
      </div>
      <div className="flex flex-col items-center gap-6">
        <FormControl
          label="hex"
          renderInput={(props) => {
            return (
              <div className="flex w-full items-center gap-4">
                #
                <TextField
                  value={baseColor}
                  onChange={(newColor) => setBaseColor(newColor)}
                  {...props}
                />
              </div>
            );
          }}
        />
        <FormControl
          label="rgb"
          renderInput={(props) => {
            const { id, describedbyId, ...rest } = props;
            return (
              <div className="flex items-center gap-2">
                rgb(
                <NumberField
                  id={id}
                  describedbyId={describedbyId}
                  value={rgb.r}
                  onChange={(red) => handleChangeRgb(red, 'r')}
                  max={255}
                  min={0}
                  {...rest}
                />
                ,
                <NumberField
                  value={rgb.g}
                  onChange={(green) => handleChangeRgb(green, 'g')}
                  max={255}
                  min={0}
                  {...rest}
                />
                ,
                <NumberField
                  value={rgb.b}
                  onChange={(blue) => handleChangeRgb(blue, 'b')}
                  max={255}
                  min={0}
                  {...rest}
                />
                ,
                <NumberField
                  value={rgb.a ?? 1}
                  onChange={(alpha) => handleChangeRgb(alpha, 'a')}
                  max={1}
                  min={0}
                  step={0.01}
                  precision={2}
                  {...rest}
                />
                )
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};
