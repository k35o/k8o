'use client';

import {
  Button,
  CopyIcon,
  FormControl,
  Slider,
  useClipboard,
  useToast,
} from '@k8o/arte-odyssey';
import { cn } from '@repo/helpers/cn';
import type {
  CSSProperties,
  FC,
  KeyboardEvent,
  MouseEvent,
  TouchEvent,
} from 'react';
import { useMemo } from 'react';

import type { RadiusPosition } from '../../_types/radius-position';
import { TemplateSelector } from '../template-selector';
import { useControlPanel } from './use-control-panel';

const BASE_SIZE = 192;

const fluidPx = (mobile: number): string => {
  const desktop = mobile * 2;
  return `clamp(${mobile}px, ${((mobile * 100) / 640).toFixed(2)}vw, ${desktop}px)`;
};

type ControlKey = keyof RadiusPosition;
type ColorVariable = 'primary' | 'secondary' | 'quaternary' | 'tertiary';

type ControlConfig = {
  key: ControlKey;
  label: string;
  variable: ColorVariable;
  toStyle: (value: number) => CSSProperties;
};

const CONTROLS: ControlConfig[] = [
  {
    key: 'topLeftX',
    label: '左上の上側の丸みを調整する(左右キーで操作します)',
    variable: 'primary',
    toStyle: (v) => ({ top: '-12px', left: `calc(${v}% - 12px)` }),
  },
  {
    key: 'topRightX',
    label: '右上の上側の丸みを調整する(左右キーで操作します)',
    variable: 'secondary',
    toStyle: (v) => ({ top: '-12px', right: `calc(${v}% - 12px)` }),
  },
  {
    key: 'topLeftY',
    label: '左上の左側の丸みを調整する(上下キーで操作します)',
    variable: 'primary',
    toStyle: (v) => ({ top: `calc(${v}% - 12px)`, left: '-12px' }),
  },
  {
    key: 'topRightY',
    label: '右上の右側の丸みを調整する(上下キーで操作します)',
    variable: 'secondary',
    toStyle: (v) => ({ top: `calc(${v}% - 12px)`, right: '-12px' }),
  },
  {
    key: 'bottomLeftY',
    label: '左下の左側の丸みを調整する(上下キーで操作します)',
    variable: 'quaternary',
    toStyle: (v) => ({ bottom: `calc(${v}% - 12px)`, left: '-12px' }),
  },
  {
    key: 'bottomRightY',
    label: '右下の右側の丸みを調整する(上下キーで操作します)',
    variable: 'tertiary',
    toStyle: (v) => ({ bottom: `calc(${v}% - 12px)`, right: '-12px' }),
  },
  {
    key: 'bottomLeftX',
    label: '左下の下側の丸みを調整する(左右キーで操作します)',
    variable: 'quaternary',
    toStyle: (v) => ({ bottom: '-12px', left: `calc(${v}% - 12px)` }),
  },
  {
    key: 'bottomRightX',
    label: '右下の下側の丸みを調整する(左右キーで操作します)',
    variable: 'tertiary',
    toStyle: (v) => ({ bottom: '-12px', right: `calc(${v}% - 12px)` }),
  },
];

const OperateButton: FC<{
  label: string;
  position: CSSProperties;
  variable: ColorVariable;
  onMouseDown: (e: MouseEvent) => void;
  onTouchStart: (e: TouchEvent) => void;
  onKeyDown: (e: KeyboardEvent) => void;
  isActive: boolean;
}> = ({
  label,
  position,
  variable,
  onMouseDown,
  onTouchStart,
  onKeyDown,
  isActive,
}) => (
  <button
    className={cn(
      'absolute size-6 rounded-full border-2 border-border-base sm:size-5',
      variable === 'primary' && 'bg-group-primary',
      variable === 'secondary' && 'bg-group-secondary',
      variable === 'quaternary' && 'bg-group-quaternary',
      variable === 'tertiary' && 'bg-group-tertiary',
      isActive && 'border-transparent outline-hidden ring-4 ring-fg-mute',
      'hover:border-transparent hover:outline-hidden hover:ring-4 hover:ring-fg-mute',
      'focus-visible:border-transparent focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-fg-mute',
    )}
    onKeyDown={onKeyDown}
    onMouseDown={onMouseDown}
    onTouchStart={onTouchStart}
    style={position}
    type="button"
  >
    <span className="sr-only">{label}</span>
  </button>
);

export const ControlPanel: FC = () => {
  const {
    activePosition,
    containerRef,
    mouseDownHandler,
    touchStartHandler,
    keyDownHandler,
    borderRadius,
    position,
    setPosition,
    aspectRatio,
    setAspectRatio,
  } = useControlPanel();
  const { writeClipboard } = useClipboard();
  const { onOpen } = useToast();

  const containerSize = useMemo(() => {
    if (aspectRatio >= 1) {
      return { width: BASE_SIZE, height: BASE_SIZE / aspectRatio };
    }
    return { width: BASE_SIZE * aspectRatio, height: BASE_SIZE };
  }, [aspectRatio]);

  const handleCopy = async () => {
    try {
      await writeClipboard(`border-radius: ${borderRadius}`);
      onOpen('success', 'クリップボードにコピーしました');
    } catch {
      onOpen('error', 'コピーに失敗しました');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-8 sm:grid sm:grid-cols-[1fr_16rem] sm:items-start sm:gap-6">
        <div className="order-1 sm:order-2">
          <TemplateSelector currentPosition={position} onSelect={setPosition} />
          <div className="mt-6">
            <FormControl
              label="縦横比"
              renderInput={(props) => (
                <Slider
                  {...props}
                  max={2}
                  min={0.5}
                  onChange={setAspectRatio}
                  step={0.1}
                  value={aspectRatio}
                />
              )}
            />
          </div>
        </div>

        <div className="order-2 flex items-center justify-center sm:sticky sm:top-6 sm:order-1">
          <div
            className="flex items-center justify-center"
            style={{
              width: `calc(${fluidPx(BASE_SIZE)} + 24px)`,
              height: `calc(${fluidPx(BASE_SIZE)} + 24px)`,
            }}
          >
            <div
              className="border-primary-border relative border-2 border-dashed"
              ref={containerRef}
              style={{
                width: fluidPx(containerSize.width),
                height: fluidPx(containerSize.height),
              }}
            >
              <div
                className="bg-primary-fg absolute size-full"
                style={{ borderRadius }}
              />
              {CONTROLS.map(({ key, label, variable, toStyle }) => (
                <OperateButton
                  isActive={activePosition === key}
                  key={key}
                  label={label}
                  onKeyDown={(e) => {
                    keyDownHandler(e, key);
                  }}
                  onMouseDown={(e) => {
                    mouseDownHandler(e, key);
                  }}
                  onTouchStart={(e) => {
                    touchStartHandler(e, key);
                  }}
                  position={toStyle(position[key])}
                  variable={variable}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-border-base bg-bg-base relative rounded-xl border p-4">
        <div className="absolute top-3 right-3">
          <Button
            onClick={() => {
              void handleCopy();
            }}
            size="sm"
            startIcon={<CopyIcon size="sm" />}
            variant="outline"
          >
            コピー
          </Button>
        </div>
        <p className="text-fg-mute mb-2 text-xs font-bold">border-radius</p>
        <code className="text-fg-base grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-sm">
          <span className="text-fg-mute">水平</span>
          <span>
            {position.topLeftX}% {100 - position.topRightX}%{' '}
            {100 - position.bottomRightX}% {position.bottomLeftX}%
          </span>
          <span className="text-fg-mute">垂直</span>
          <span>
            {position.topLeftY}% {position.topRightY}%{' '}
            {100 - position.bottomRightY}% {100 - position.bottomLeftY}%
          </span>
        </code>
      </div>
    </div>
  );
};
