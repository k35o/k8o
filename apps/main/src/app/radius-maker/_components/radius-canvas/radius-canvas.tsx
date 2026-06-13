/* oxlint-disable jsx-a11y/prefer-tag-over-role -- 枠線上を自由に動くドラッグハンドルはinput[type=range]では表現できないため、WAI-ARIAのsliderパターンで実装する */
'use client';

import { cn } from '@repo/helpers/cn';
import { between } from '@repo/helpers/number/between';
import {
  type CSSProperties,
  type FC,
  type KeyboardEvent,
  type PointerEvent,
  useRef,
  useState,
} from 'react';

import type { Axis, Corner, RadiusCorners } from '../../_types/corner-radius';
import type { CornerShape } from '../../_types/corner-shape';
import {
  AXIS_LABELS,
  CORNER_COLOR_CLASSES,
  CORNER_LABELS,
} from '../../_utils/corner-meta';
import { toBorderRadiusValue } from '../../_utils/radius-css';

type Handle = {
  corner: Corner;
  axis: Axis;
};

const HANDLES: Handle[] = [
  { corner: 'topLeft', axis: 'x' },
  { corner: 'topRight', axis: 'x' },
  { corner: 'topLeft', axis: 'y' },
  { corner: 'topRight', axis: 'y' },
  { corner: 'bottomLeft', axis: 'y' },
  { corner: 'bottomRight', axis: 'y' },
  { corner: 'bottomLeft', axis: 'x' },
  { corner: 'bottomRight', axis: 'x' },
];

// 数値が大きいほどハンドルが角から遠ざかる向きが、画面座標と逆になる組み合わせ
const isInverted = (corner: Corner, axis: Axis): boolean =>
  axis === 'x'
    ? corner === 'topRight' || corner === 'bottomRight'
    : corner === 'bottomLeft' || corner === 'bottomRight';

const handlePositionStyle = (
  corner: Corner,
  axis: Axis,
  value: number,
): CSSProperties => {
  const offset = isInverted(corner, axis) ? 100 - value : value;
  if (axis === 'x') {
    return {
      left: `${offset}%`,
      top: corner === 'topLeft' || corner === 'topRight' ? '0%' : '100%',
    };
  }
  return {
    top: `${offset}%`,
    left: corner === 'topLeft' || corner === 'bottomLeft' ? '0%' : '100%',
  };
};

// 矢印キーの画面上の向きを値の増減に変換する。対応しないキーはnull
const arrowKeyToDelta = (
  key: string,
  corner: Corner,
  axis: Axis,
): number | null => {
  if (axis === 'x') {
    if (key !== 'ArrowRight' && key !== 'ArrowLeft') {
      return null;
    }
    const screenDelta = key === 'ArrowRight' ? 1 : -1;
    return isInverted(corner, axis) ? -screenDelta : screenDelta;
  }
  if (key !== 'ArrowDown' && key !== 'ArrowUp') {
    return null;
  }
  const screenDelta = key === 'ArrowDown' ? 1 : -1;
  return isInverted(corner, axis) ? -screenDelta : screenDelta;
};

type Props = {
  corners: RadiusCorners;
  shape: CornerShape;
  width: number;
  height: number;
  onChangeValue: (corner: Corner, axis: Axis, value: number) => void;
};

export const RadiusCanvas: FC<Props> = ({
  corners,
  shape,
  width,
  height,
  onChangeValue,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeHandle, setActiveHandle] = useState<Handle | null>(null);

  const isActive = (corner: Corner, axis: Axis): boolean =>
    activeHandle?.corner === corner && activeHandle.axis === axis;

  const handlePointerDown = (
    e: PointerEvent<HTMLDivElement>,
    corner: Corner,
    axis: Axis,
  ) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.focus();
    setActiveHandle({ corner, axis });
  };

  const handlePointerMove = (
    e: PointerEvent<HTMLDivElement>,
    corner: Corner,
    axis: Axis,
  ) => {
    if (!isActive(corner, axis)) {
      return;
    }
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const ratio =
      axis === 'x'
        ? (e.clientX - rect.left) / rect.width
        : (e.clientY - rect.top) / rect.height;
    const percent = Math.round(between(ratio, 0, 1) * 100);
    onChangeValue(
      corner,
      axis,
      isInverted(corner, axis) ? 100 - percent : percent,
    );
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLDivElement>,
    corner: Corner,
    axis: Axis,
  ) => {
    const delta = arrowKeyToDelta(e.key, corner, axis);
    if (delta === null) {
      return;
    }
    e.preventDefault();
    const step = e.shiftKey ? 10 : 1;
    onChangeValue(
      corner,
      axis,
      between(corners[corner][axis] + delta * step, 0, 100),
    );
  };

  return (
    <div
      className="text-border-mute bg-bg-subtle flex items-center justify-center rounded-2xl px-10 py-12"
      style={{
        backgroundImage:
          'radial-gradient(currentColor 1.5px, transparent 1.5px)',
        backgroundSize: '16px 16px',
      }}
    >
      <div
        className="border-primary-border relative border-2 border-dashed"
        ref={containerRef}
        style={{
          width: `min(100%, ${width}px)`,
          aspectRatio: `${width} / ${height}`,
        }}
      >
        <div
          className={cn(
            'bg-primary-fg size-full',
            activeHandle === null &&
              'transition-[border-radius] duration-150 ease-out motion-reduce:transition-none',
          )}
          style={{
            borderRadius: toBorderRadiusValue(corners),
            cornerShape: shape === 'round' ? undefined : shape,
          }}
        />
        {HANDLES.map(({ corner, axis }) => {
          const value = corners[corner][axis];
          const active = isActive(corner, axis);
          return (
            <div
              aria-label={`${CORNER_LABELS[corner]}の${AXIS_LABELS[axis]}方向の丸み`}
              aria-orientation={axis === 'x' ? 'horizontal' : 'vertical'}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={value}
              aria-valuetext={`${value}%`}
              className={cn(
                'group/handle absolute size-6 touch-none rounded-full sm:size-5',
                '-translate-x-1/2 -translate-y-1/2',
                'border-border-base border-2',
                CORNER_COLOR_CLASSES[corner],
                active
                  ? 'ring-fg-mute cursor-grabbing border-transparent ring-4'
                  : 'cursor-grab',
                'hover:ring-fg-mute hover:border-transparent hover:ring-4',
                'focus-visible:ring-fg-mute focus-visible:border-transparent focus-visible:ring-4 focus-visible:outline-hidden',
              )}
              key={`${corner}-${axis}`}
              onKeyDown={(e) => {
                handleKeyDown(e, corner, axis);
              }}
              onLostPointerCapture={() => {
                setActiveHandle(null);
              }}
              onPointerDown={(e) => {
                handlePointerDown(e, corner, axis);
              }}
              onPointerMove={(e) => {
                handlePointerMove(e, corner, axis);
              }}
              role="slider"
              style={handlePositionStyle(corner, axis, value)}
              tabIndex={0}
            >
              <span
                className={cn(
                  'bg-fg-base text-bg-base absolute -top-8 left-1/2 -translate-x-1/2',
                  'rounded-md px-1.5 py-0.5 font-mono text-xs whitespace-nowrap',
                  'pointer-events-none opacity-0 group-focus-visible/handle:opacity-100',
                  active && 'opacity-100',
                )}
              >
                {value}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
