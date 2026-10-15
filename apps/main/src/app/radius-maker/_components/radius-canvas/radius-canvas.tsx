'use client';

import { cn } from '@repo/helpers/cn';
import { between } from '@repo/helpers/number/between';
import { useRef, useState } from 'react';
import type { CSSProperties, FC, KeyboardEvent, PointerEvent } from 'react';

import type { Axis, Corner, RadiusCorners } from '../../_types/corner-radius';
import type { CornerShape } from '../../_types/corner-shape';
import { AXIS_LABELS, CORNER_LABELS } from '../../_utils/corner-meta';
import { toBorderRadiusValue } from '../../_utils/radius-css';

import styles from './radius-canvas.module.css';

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
      className={styles.root}
      style={{
        backgroundImage:
          'radial-gradient(currentColor 1.5px, transparent 1.5px)',
        backgroundSize: '16px 16px',
      }}
    >
      <div
        className={styles.frame}
        ref={containerRef}
        style={{
          width: `min(100%, ${width}px)`,
          aspectRatio: `${width} / ${height}`,
        }}
      >
        <div
          className={cn(
            styles.shape,
            activeHandle === null && styles.shapeAnimated,
          )}
          style={{
            borderRadius: toBorderRadiusValue(corners),
            cornerShape: shape === 'round' ? undefined : shape,
          }}
        />
        {HANDLES.map(({ corner, axis }) => {
          const value = corners[corner][axis];
          const active = isActive(corner, axis);
          // 枠線上を自由に動くドラッグハンドルは input[type=range] では表現できないため、
          // WAI-ARIA の slider パターンで実装する
          return (
            <div
              aria-label={`${CORNER_LABELS[corner]}の${AXIS_LABELS[axis]}方向の丸み`}
              aria-orientation={axis === 'x' ? 'horizontal' : 'vertical'}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={value}
              aria-valuetext={`${value}%`}
              className={styles.handle}
              data-active={active}
              data-corner={corner}
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
              <span className={styles.tooltip}>{value}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
