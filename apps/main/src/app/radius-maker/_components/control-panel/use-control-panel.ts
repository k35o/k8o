import { between } from '@repo/helpers/number/between';
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { RadiusPosition } from '../../_types/radius-position';
import { positionToBorderRadius } from '../../_utils/position-to-border-radius';

type Position = keyof RadiusPosition;

// その軸での「正方向」（数値が大きいほど右下に動くか）が反転している頂点を判定する。
// top-Y と (Left & X) は素直に正方向、それ以外は 100 - value で反転する。
const isPositiveAxis = (target: Position): boolean =>
  (target.startsWith('top') && target.endsWith('Y')) ||
  (target.includes('Left') && target.endsWith('X'));

const computeValueFromPoint = (
  rect: DOMRect,
  target: Position,
  clientX: number,
  clientY: number,
): number => {
  const ratio = target.endsWith('X')
    ? (clientX - rect.left) / rect.width
    : (clientY - rect.top) / rect.height;
  const raw = Math.floor(between(ratio * 100, 0, 100));
  return isPositiveAxis(target) ? raw : 100 - raw;
};

const computeArrowDelta = (target: Position, key: string): number | null => {
  if (target.endsWith('X')) {
    if (key !== 'ArrowRight' && key !== 'ArrowLeft') return null;
    const direction = key === 'ArrowRight' ? 1 : -1;
    return target.endsWith('LeftX') ? direction : -direction;
  }
  if (key !== 'ArrowUp' && key !== 'ArrowDown') return null;
  const direction = key === 'ArrowDown' ? 1 : -1;
  return target.startsWith('top') ? direction : -direction;
};

export const useControlPanel = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<RadiusPosition>({
    topLeftX: 63,
    topLeftY: 37,
    topRightX: 24,
    topRightY: 54,
    bottomLeftX: 53,
    bottomLeftY: 26,
    bottomRightX: 32,
    bottomRightY: 36,
  });
  const [activePosition, setActivePosition] = useState<Position | null>(null);
  const [aspectRatio, setAspectRatio] = useState(1);

  const borderRadius = useMemo(
    () => positionToBorderRadius(position),
    [position],
  );

  const mouseDownHandler = useCallback(
    (e: ReactMouseEvent, target: Position) => {
      e.preventDefault();
      setActivePosition(target);
      const handleMove = (event: MouseEvent) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const nextValue = computeValueFromPoint(
          rect,
          target,
          event.clientX,
          event.clientY,
        );
        setPosition((prev) => ({ ...prev, [target]: nextValue }));
      };
      const handleUp = () => {
        setActivePosition(null);
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
      };
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    },
    [],
  );

  const touchStartHandler = useCallback(
    (e: ReactTouchEvent, target: Position) => {
      e.preventDefault();
      setActivePosition(target);
      const handleMove = (event: TouchEvent) => {
        event.preventDefault();
        const touch = event.changedTouches[0];
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect || !touch) return;
        const nextValue = computeValueFromPoint(
          rect,
          target,
          touch.clientX,
          touch.clientY,
        );
        setPosition((prev) => ({ ...prev, [target]: nextValue }));
      };
      const handleEnd = () => {
        setActivePosition(null);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleEnd);
      };
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    },
    [],
  );

  const keyDownHandler = useCallback(
    (e: ReactKeyboardEvent, target: Position) => {
      const delta = computeArrowDelta(target, e.key);
      if (delta === null) return;
      e.preventDefault();
      setPosition((prev) => ({
        ...prev,
        [target]: between(prev[target] + delta, 0, 100),
      }));
    },
    [],
  );

  return {
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
  };
};
