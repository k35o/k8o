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
  const [aspectRatio, setAspectRatio] = useState(1); // 0.5〜2.0（横幅/縦幅）

  const borderRadius = useMemo(
    () => positionToBorderRadius(position),
    [position],
  );

  const mouseDownHandler = useCallback(
    (
      e: ReactMouseEvent,
      targetPosition:
        | 'topLeftX'
        | 'topLeftY'
        | 'topRightX'
        | 'topRightY'
        | 'bottomRightX'
        | 'bottomRightY'
        | 'bottomLeftX'
        | 'bottomLeftY',
    ) => {
      e.preventDefault();
      setActivePosition(targetPosition);
      const mouseUpHandler = (event: MouseEvent) => {
        setPosition((prev) => {
          if (!containerRef.current) {
            return prev;
          }
          const rect = containerRef.current.getBoundingClientRect();
          const newValue = Math.floor(
            between(
              targetPosition.endsWith('X')
                ? ((event.clientX - rect.left) / rect.width) * 100
                : ((event.clientY - rect.top) / rect.height) * 100,
              0,
              100,
            ),
          );
          return {
            ...prev,
            [targetPosition]:
              (targetPosition.startsWith('top') &&
                targetPosition.endsWith('Y')) ||
              (targetPosition.includes('Left') && targetPosition.endsWith('X'))
                ? newValue
                : 100 - newValue,
          };
        });
      };
      window.addEventListener('mouseup', () => {
        setActivePosition(null);
        window.removeEventListener('mousemove', mouseUpHandler);
      });
      window.addEventListener('mousemove', mouseUpHandler);
    },
    [],
  );

  const touchStartHandler = useCallback(
    (
      e: ReactTouchEvent,
      targetPosition:
        | 'topLeftX'
        | 'topLeftY'
        | 'topRightX'
        | 'topRightY'
        | 'bottomRightX'
        | 'bottomRightY'
        | 'bottomLeftX'
        | 'bottomLeftY',
    ) => {
      e.preventDefault();
      setActivePosition(targetPosition);
      const touchMoveHandler = (event: TouchEvent) => {
        event.preventDefault();
        setPosition((prev) => {
          const changedTouches = event.changedTouches[0];
          if (!(containerRef.current && changedTouches)) {
            return prev;
          }
          const rect = containerRef.current.getBoundingClientRect();
          const newValue = Math.floor(
            between(
              targetPosition.endsWith('X')
                ? ((changedTouches.clientX - rect.left) / rect.width) * 100
                : ((changedTouches.clientY - rect.top) / rect.height) * 100,
              0,
              100,
            ),
          );
          return {
            ...prev,
            [targetPosition]:
              (targetPosition.startsWith('top') &&
                targetPosition.endsWith('Y')) ||
              (targetPosition.includes('Left') && targetPosition.endsWith('X'))
                ? newValue
                : 100 - newValue,
          };
        });
      };
      window.addEventListener('touchend', () => {
        setActivePosition(null);
        window.removeEventListener('touchmove', touchMoveHandler);
      });
      window.addEventListener('touchmove', touchMoveHandler, {
        passive: false,
      });
    },
    [],
  );

  const keyDownHandler = useCallback(
    (
      e: ReactKeyboardEvent,
      targetPosition:
        | 'topLeftX'
        | 'topLeftY'
        | 'topRightX'
        | 'topRightY'
        | 'bottomRightX'
        | 'bottomRightY'
        | 'bottomLeftX'
        | 'bottomLeftY',
    ) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        if (targetPosition.endsWith('LeftX')) {
          setPosition((prev) => ({
            ...prev,
            [targetPosition]: between(
              prev[targetPosition] + (e.key === 'ArrowRight' ? 1 : -1),
              0,
              100,
            ),
          }));
        }
        if (targetPosition.endsWith('RightX')) {
          setPosition((prev) => ({
            ...prev,
            [targetPosition]: between(
              prev[targetPosition] + (e.key === 'ArrowLeft' ? 1 : -1),
              0,
              100,
            ),
          }));
        }
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (targetPosition.startsWith('top') && targetPosition.endsWith('Y')) {
          setPosition((prev) => ({
            ...prev,
            [targetPosition]: between(
              prev[targetPosition] + (e.key === 'ArrowDown' ? 1 : -1),
              0,
              100,
            ),
          }));
        }
        if (
          targetPosition.startsWith('bottom') &&
          targetPosition.endsWith('Y')
        ) {
          setPosition((prev) => ({
            ...prev,
            [targetPosition]: between(
              prev[targetPosition] + (e.key === 'ArrowUp' ? 1 : -1),
              0,
              100,
            ),
          }));
        }
      }
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
