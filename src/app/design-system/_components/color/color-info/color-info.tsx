import {
  Color,
  COLOR_VARIANTS,
  SEMANTIC_COLOR_VARIANTS,
  Stage,
} from '@/app/design-system/_utils/color';
import { FC } from 'react';
import { ColorUnit } from './color-unit';

const getColorCode = (code: `${Color}.${Stage}` | 'white') => {
  if (code === 'white') return COLOR_VARIANTS.white;
  const [color, stage] = code.split('.') as [Color, Stage];
  return COLOR_VARIANTS[color][stage];
};

export const ColorInfo: FC<{
  name: string;
  code: `${Color}.${Stage}` | 'white';
  codeDark: `${Color}.${Stage}` | 'white';
  variant: 'background' | 'border' | 'foreground';
}> = ({ name, code, codeDark, variant }) => {
  const colorCode = getColorCode(code);
  const colorCodeDark = getColorCode(codeDark);

  return (
    <div className="relative flex flex-wrap items-center gap-2 rounded-lg border p-4">
      <p className="bg-bg-base absolute top-0 left-0 -translate-y-3 translate-x-2 px-1 font-bold">
        {name}
        <span className="font-normal">
          （{code}&nbsp;/&nbsp;{codeDark}）
        </span>
      </p>
      {variant === 'foreground' && (
        <>
          <ColorUnit
            colorCode={colorCode}
            colorCodeDark={colorCodeDark}
            contrastName="bg-base"
            contrastCode={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.bg.base.light,
            )}
            contrastCodeDark={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.bg.base.dark,
            )}
            variant="foreground"
          />
          <ColorUnit
            colorCode={colorCode}
            colorCodeDark={colorCodeDark}
            contrastName="bg-subtle"
            contrastCode={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.bg.subtle.light,
            )}
            contrastCodeDark={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.bg.subtle.dark,
            )}
            variant="foreground"
          />
          <ColorUnit
            colorCode={colorCode}
            colorCodeDark={colorCodeDark}
            contrastName="bg-mute"
            contrastCode={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.bg.mute.light,
            )}
            contrastCodeDark={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.bg.mute.dark,
            )}
            variant="foreground"
          />
          <ColorUnit
            colorCode={colorCode}
            colorCodeDark={colorCodeDark}
            contrastName="bg-emphasize"
            contrastCode={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.bg.emphasize.light,
            )}
            contrastCodeDark={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.bg.emphasize.dark,
            )}
            variant="foreground"
          />
          <ColorUnit
            colorCode={colorCode}
            colorCodeDark={colorCodeDark}
            contrastName="bg-inverse"
            contrastCode={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.bg.inverse.light,
            )}
            contrastCodeDark={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.bg.inverse.dark,
            )}
            variant="foreground"
          />
        </>
      )}
      {variant === 'background' && (
        <>
          <ColorUnit
            colorCode={colorCode}
            colorCodeDark={colorCodeDark}
            contrastName="fg-base"
            contrastCode={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.fg.base.light,
            )}
            contrastCodeDark={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.fg.base.dark,
            )}
            variant="background"
          />
          <ColorUnit
            colorCode={colorCode}
            colorCodeDark={colorCodeDark}
            contrastName="fg-subtle"
            contrastCode={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.fg.subtle.light,
            )}
            contrastCodeDark={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.fg.subtle.dark,
            )}
            variant="background"
          />
          <ColorUnit
            colorCode={colorCode}
            colorCodeDark={colorCodeDark}
            contrastName="fg-mute"
            contrastCode={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.fg.mute.light,
            )}
            contrastCodeDark={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.fg.mute.dark,
            )}
            variant="background"
          />
          <ColorUnit
            colorCode={colorCode}
            colorCodeDark={colorCodeDark}
            contrastName="fg-inverse"
            contrastCode={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.fg.inverse.light,
            )}
            contrastCodeDark={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.fg.inverse.dark,
            )}
            variant="background"
          />
        </>
      )}
      {variant === 'border' && (
        <>
          <ColorUnit
            colorCode={colorCode}
            colorCodeDark={colorCodeDark}
            contrastName="bg-base"
            contrastCode={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.bg.base.light,
            )}
            contrastCodeDark={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.bg.base.dark,
            )}
            variant="border"
          />
          <ColorUnit
            colorCode={colorCode}
            colorCodeDark={colorCodeDark}
            contrastName="bg-subtle"
            contrastCode={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.bg.subtle.light,
            )}
            contrastCodeDark={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.bg.subtle.dark,
            )}
            variant="border"
          />
          <ColorUnit
            colorCode={colorCode}
            colorCodeDark={colorCodeDark}
            contrastName="bg-mute"
            contrastCode={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.bg.mute.light,
            )}
            contrastCodeDark={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.bg.mute.dark,
            )}
            variant="border"
          />
          <ColorUnit
            colorCode={colorCode}
            colorCodeDark={colorCodeDark}
            contrastName="bg-emphasize"
            contrastCode={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.bg.emphasize.light,
            )}
            contrastCodeDark={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.bg.emphasize.dark,
            )}
            variant="border"
          />
          <ColorUnit
            colorCode={colorCode}
            colorCodeDark={colorCodeDark}
            contrastName="bg-inverse"
            contrastCode={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.bg.inverse.light,
            )}
            contrastCodeDark={getColorCode(
              SEMANTIC_COLOR_VARIANTS.base.bg.inverse.dark,
            )}
            variant="border"
          />
        </>
      )}
    </div>
  );
};
