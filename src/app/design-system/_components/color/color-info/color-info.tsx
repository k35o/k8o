'use client';

import { ColorContrastBg } from './color-contrast-bg';
import { ColorContrastFg } from './color-contrast-fg';
import {
  hexToHsl,
  hexToRgb,
} from '@/app/color-converter/_utils/color-converter';
import {
  Color,
  getColorCode,
  Stage,
} from '@/app/design-system/_utils/color';
import {
  ChevronIcon,
  ColorContrastIcon,
  ColorInfoIcon,
} from '@/components/icons';
import { cn } from '@/helpers/cn';
import { toPrecision } from '@/helpers/number/to-precision';
import * as motion from 'motion/react-client';
import { FC, useId, useState } from 'react';

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
        'border-border-base flex flex-col rounded-md border',
        isOpen && 'col-span-full',
      )}
      transition={{
        default: { ease: 'spring' },
        layout: { duration: 0.3 },
      }}
      layout
    >
      <button
        aria-expanded={isOpen}
        aria-controls={`${id}-panel`}
        aria-label={
          isOpen
            ? `${name}の詳細情報を非表示にする`
            : `${name}の詳細情報を表示する`
        }
        id={`${id}-button`}
        className={cn(
          'flex items-center justify-between gap-4 p-4',
          'hover:bg-bg-mute rounded-md',
          'focus-visible::first:ring-border-info focus-visible:bg-bg-mute',
        )}
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
      >
        <div className="flex items-center gap-4">
          <div className="border-border-base flex rounded-full border">
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
          <p className="text-xl font-bold">{name}</p>
        </div>
        <motion.span
          animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronIcon direction="down" />
        </motion.span>
      </button>
      <motion.div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-button`}
        hidden={!isOpen}
        className={isOpen ? undefined : 'hidden'}
        animate={{
          opacity: isOpen ? 1 : 0,
          height: isOpen ? 'auto' : 0,
          transition: {
            duration: 0.5,
            delay: 0.3,
          },
        }}
      >
        <div className="flex flex-col gap-4 p-4 pt-2">
          <section className="flex flex-col gap-2">
            <p className="flex items-center text-lg font-bold">
              <ColorInfoIcon />
              色の情報（light&nbsp;/&nbsp;dark）
            </p>
            <p className="font-bold">
              基本色:&nbsp;
              <span className="text-lg font-normal">
                {`${code} / ${codeDark}`}
              </span>
            </p>
            <p className="font-bold">
              HEX:&nbsp;
              <span className="text-lg font-normal">
                {`${colorCode} / ${colorCodeDark}`}
              </span>
            </p>
            <p className="font-bold">
              RGB:&nbsp;
              <span className="text-lg font-normal">
                {`${rgb.r.toString()},${rgb.g.toString()},${rgb.b.toString()} / ${rgbDark.r.toString()},${rgbDark.g.toString()},${rgbDark.b.toString()}`}
              </span>
            </p>
            <p className="font-bold">
              HSL:&nbsp;
              <span className="text-lg font-normal">
                {`${toPrecision(hsl.h, 0).toString()},${toPrecision(hsl.s, 0).toString()},${toPrecision(hsl.l, 0).toString()} / ${toPrecision(hslDark.h, 0).toString()},${toPrecision(hslDark.s, 0).toString()},${toPrecision(hslDark.l, 0).toString()}`}
              </span>
            </p>
          </section>
          {(variant === 'foreground' || variant === 'background') && (
            <section className="flex flex-col gap-2">
              <p className="flex items-center text-lg font-bold">
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
      </motion.div>
    </motion.div>
  );
};
