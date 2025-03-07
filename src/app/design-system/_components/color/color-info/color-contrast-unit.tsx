import { cn } from '@/utils/cn';
import { calcContrast } from '@/utils/color/calc_contrast';
import { toPrecision } from '@/utils/number/to-precision';
import { FC } from 'react';

export const ColorContrastUnit: FC<{
  colorCode: string;
  colorCodeDark: string;
  contrastName: string;
  contrastCode: string;
  contrastCodeDark: string;
  variant: 'background' | 'border' | 'foreground';
}> = ({
  colorCode,
  colorCodeDark,
  contrastName,
  contrastCode,
  contrastCodeDark,
  variant,
}) => {
  const colorContrast = toPrecision(
    calcContrast(colorCode, contrastCode),
    2,
  );
  const colorContrastDark = toPrecision(
    calcContrast(colorCodeDark, contrastCodeDark),
    2,
  );

  return (
    <div className="flex w-44 flex-col items-center gap-2">
      <p>{contrastName}</p>
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center gap-1">
          <div
            className="border-border-base flex size-12 items-center justify-center rounded-full border"
            style={
              variant === 'foreground'
                ? {
                    color: colorCode,
                    backgroundColor: contrastCode,
                  }
                : variant === 'background'
                  ? {
                      color: contrastCode,
                      backgroundColor: colorCode,
                    }
                  : {
                      borderColor: colorCode,
                      backgroundColor: contrastCode,
                    }
            }
          >
            light
          </div>
          {variant !== 'border' && (
            <p
              className={cn(
                'text-xs',
                colorContrast >= 4.5
                  ? 'text-fg-success'
                  : 'text-fg-error',
              )}
            >
              {colorContrast}
            </p>
          )}
        </div>
        <div className="flex flex-col items-center gap-1">
          <div
            className="border-border-base flex size-12 items-center justify-center rounded-full border"
            style={
              variant === 'foreground'
                ? {
                    color: colorCodeDark,
                    backgroundColor: contrastCodeDark,
                  }
                : variant === 'background'
                  ? {
                      color: contrastCodeDark,
                      backgroundColor: colorCodeDark,
                    }
                  : {
                      borderColor: colorCodeDark,
                      backgroundColor: contrastCodeDark,
                    }
            }
          >
            dark
          </div>
          {variant !== 'border' && (
            <p
              className={cn(
                'text-xs',
                colorContrastDark >= 4.5
                  ? 'text-fg-success'
                  : 'text-fg-error',
              )}
            >
              {colorContrastDark}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
