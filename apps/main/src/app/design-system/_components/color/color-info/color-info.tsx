'use client';

import {
  ChevronIcon,
  ColorContrastIcon,
  ColorInfoIcon,
} from '@k8o/arte-odyssey/icons';
import { cn } from '@repo/helpers/cn';
import { toPrecision } from '@repo/helpers/number/to-precision';
import * as motion from 'motion/react-client';
import { type FC, useId, useState } from 'react';
import {
  hexToHsl,
  hexToRgb,
} from '@/app/color-converter/_utils/color-converter';
import {
  type Color,
  getColorCode,
  type Stage,
} from '@/app/design-system/_utils/color';
import { ColorContrastBg } from './color-contrast-bg';
import { ColorContrastFg } from './color-contrast-fg';

export const ColorInfo: FC<{
  name: string;
  code: `${Color}.${Stage}` | 'white';
  codeDark: `${Color}.${Stage}` | 'white';
  variant: 'background' | 'border' | 'foreground';
}> = ({ name, code, codeDark, variant }) => {
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);
  const colorCode = getColorCode(code);
  const colorCodeDark = getColorCode(codeDark);
  const rgb = hexToRgb(colorCode.slice(1));
  const rgbDark = hexToRgb(colorCodeDark.slice(1));
  const hsl = hexToHsl(colorCode.slice(1));
  const hslDark = hexToHsl(colorCodeDark.slice(1));

  return (
    <motion.div
      className={cn(
        'flex flex-col rounded-md border border-border-base',
        isOpen && 'col-span-full',
      )}
      layout
      transition={{
        default: { ease: 'easeInOut' },
        layout: { duration: 0.3 },
      }}
    >
      <button
        aria-controls={`${id}-panel`}
        aria-expanded={isOpen}
        aria-label={
          isOpen
            ? `${name}の詳細情報を非表示にする`
            : `${name}の詳細情報を表示する`
        }
        className={cn(
          'flex items-center justify-between gap-4 p-4',
          'rounded-md hover:bg-bg-mute',
          'focus-visible:bg-bg-mute focus-visible::first:ring-border-info',
        )}
        id={`${id}-button`}
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
        type="button"
      >
        <div className="flex items-center gap-4">
          <div className="flex rounded-full border border-border-base">
            <div
              className="h-12 w-6 rounded-l-full"
              style={{
                backgroundColor: colorCode,
              }}
            />
            <div
              className="h-12 w-6 rounded-r-full"
              style={{
                backgroundColor: colorCodeDark,
              }}
            />
          </div>
          <p className="font-bold text-xl">{name}</p>
        </div>
        <motion.span
          animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronIcon direction="down" />
        </motion.span>
      </button>
      <motion.section
        animate={{
          opacity: isOpen ? 1 : 0,
          height: isOpen ? 'auto' : 0,
          transition: {
            duration: 0.5,
            delay: 0.3,
          },
        }}
        aria-labelledby={`${id}-button`}
        className={isOpen ? undefined : 'hidden'}
        hidden={!isOpen}
        id={`${id}-panel`}
      >
        <div className="flex flex-col gap-4 p-4 pt-2">
          <section className="flex flex-col gap-2">
            <p className="flex items-center font-bold text-lg">
              <ColorInfoIcon />
              色の情報（light&nbsp;/&nbsp;dark）
            </p>
            <p className="font-bold">
              基本色:&nbsp;
              <span className="font-normal text-lg">
                {`${code} / ${codeDark}`}
              </span>
            </p>
            <p className="font-bold">
              HEX:&nbsp;
              <span className="font-normal text-lg">
                {`${colorCode} / ${colorCodeDark}`}
              </span>
            </p>
            <p className="font-bold">
              RGB:&nbsp;
              <span className="font-normal text-lg">
                {`${rgb.r.toString()},${rgb.g.toString()},${rgb.b.toString()} / ${rgbDark.r.toString()},${rgbDark.g.toString()},${rgbDark.b.toString()}`}
              </span>
            </p>
            <p className="font-bold">
              HSL:&nbsp;
              <span className="font-normal text-lg">
                {`${toPrecision(hsl.h, 0).toString()},${toPrecision(hsl.s, 0).toString()},${toPrecision(hsl.l, 0).toString()} / ${toPrecision(hslDark.h, 0).toString()},${toPrecision(hslDark.s, 0).toString()},${toPrecision(hslDark.l, 0).toString()}`}
              </span>
            </p>
          </section>
          {(variant === 'foreground' || variant === 'background') && (
            <section className="flex flex-col gap-2">
              <p className="flex items-center font-bold text-lg">
                <ColorContrastIcon />
                色のコントラスト
              </p>
              {variant === 'foreground' && (
                <ColorContrastFg
                  colorCode={colorCode}
                  colorCodeDark={colorCodeDark}
                />
              )}
              {variant === 'background' && (
                <ColorContrastBg
                  colorCode={colorCode}
                  colorCodeDark={colorCodeDark}
                />
              )}
            </section>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
};
