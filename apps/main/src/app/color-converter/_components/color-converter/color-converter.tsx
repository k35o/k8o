'use client';

import { Card } from '@k8o/arte-odyssey/card';
import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { NumberField } from '@k8o/arte-odyssey/form/number-field';
import { TextField } from '@k8o/arte-odyssey/form/text-field';
import { useClipboard } from '@k8o/arte-odyssey/hooks/clipboard';
import { IconButton } from '@k8o/arte-odyssey/icon-button';
import { CopyIcon } from '@k8o/arte-odyssey/icons';
import { useToast } from '@k8o/arte-odyssey/toast';
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
  const { writeClipboard } = useClipboard();
  const { onOpen } = useToast();

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

  const handleCopy = (value: string, label: string) => {
    void writeClipboard(value).then(() => {
      onOpen('success', `${label}をコピーしました`);
    });
  };

  const rgbAlpha = rgb.a ?? 1;
  const rgbCopyValue =
    rgbAlpha < 1
      ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgbAlpha})`
      : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

  const hslAlpha = hsl.a ?? 1;
  const hslCopyValue =
    hslAlpha < 1
      ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${hslAlpha})`
      : `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  return (
    <div className="flex flex-col gap-6">
      <ColorTip color={`#${hex}`} hex={hex} />
      <Card>
        <div className="p-5">
          <FormControl
            label="hex"
            renderInput={({ labelId: _, ...props }) => {
              return (
                <div className="flex w-full items-center gap-2">
                  <span className="text-fg-mute">#</span>
                  <TextField
                    onChange={handleChangeHex}
                    value={hex}
                    {...props}
                  />
                  <IconButton
                    bg="base"
                    label="HEXをコピー"
                    onClick={() => {
                      handleCopy(`#${hex}`, 'HEX');
                    }}
                  >
                    <CopyIcon />
                  </IconButton>
                </div>
              );
            }}
          />
        </div>
      </Card>
      <Card>
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 grow">
              <FormControl
                label="rgb"
                labelAs="legend"
                renderInput={(props) => {
                  const { id, describedbyId, labelId: _, ...rest } = props;
                  return (
                    <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                      <span className="sr-only shrink-0 sm:not-sr-only">
                        rgb(
                      </span>
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
                      <span className="sr-only shrink-0 sm:not-sr-only">,</span>
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
                      <span className="sr-only shrink-0 sm:not-sr-only">,</span>
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
                      <span className="sr-only shrink-0 sm:not-sr-only">/</span>
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
                      <span className="sr-only shrink-0 sm:not-sr-only">)</span>
                    </div>
                  );
                }}
              />
            </div>
            <IconButton
              bg="base"
              label="RGBをコピー"
              onClick={() => {
                handleCopy(rgbCopyValue, 'RGB');
              }}
            >
              <CopyIcon />
            </IconButton>
          </div>
        </div>
      </Card>
      <Card>
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 grow">
              <FormControl
                label="hsl"
                labelAs="legend"
                renderInput={(props) => {
                  const { id, describedbyId, labelId: _, ...rest } = props;
                  return (
                    <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                      <span className="sr-only shrink-0 sm:not-sr-only">
                        hsl(
                      </span>
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
                      <span className="sr-only shrink-0 sm:not-sr-only">,</span>
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
                      <span className="sr-only shrink-0 sm:not-sr-only">,</span>
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
                      <span className="sr-only shrink-0 sm:not-sr-only">/</span>
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
                      <span className="sr-only shrink-0 sm:not-sr-only">)</span>
                    </div>
                  );
                }}
              />
            </div>
            <IconButton
              bg="base"
              label="HSLをコピー"
              onClick={() => {
                handleCopy(hslCopyValue, 'HSL');
              }}
            >
              <CopyIcon />
            </IconButton>
          </div>
        </div>
      </Card>
    </div>
  );
};
