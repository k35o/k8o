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

  const borderRadius = useMemo(() => {
    return positionToBorderRadius(position);
  }, [position]);

  const mouseDownHandler = useCallback(
    (
      e: ReactMouseEvent,
      position:
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
      setActivePosition(position);
      const mouseUpHandler = (e: MouseEvent) => {
        setPosition((prev) => {
          if (!containerRef.current) {
            return prev;
          }
          const rect = containerRef.current.getBoundingClientRect();
          const newValue = Math.floor(
            between(
              position.endsWith('X')
                ? ((e.clientX - rect.left) / rect.width) * 100
                : ((e.clientY - rect.top) / rect.height) * 100,
              0,
              100,
            ),
          );
          return {
            ...prev,
            [position]:
              (position.startsWith('top') && position.endsWith('Y')) ||
              (position.includes('Left') && position.endsWith('X'))
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
      position:
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
      setActivePosition(position);
      const touchMoveHandler = (e: TouchEvent) => {
        e.preventDefault();
        setPosition((prev) => {
          const changedTouches = e.changedTouches[0];
          if (!(containerRef.current && changedTouches)) {
            return prev;
          }
          const rect = containerRef.current.getBoundingClientRect();
          const newValue = Math.floor(
            between(
              position.endsWith('X')
                ? ((changedTouches.clientX - rect.left) / rect.width) * 100
                : ((changedTouches.clientY - rect.top) / rect.height) * 100,
              0,
              100,
            ),
          );
          return {
            ...prev,
            [position]:
              (position.startsWith('top') && position.endsWith('Y')) ||
              (position.includes('Left') && position.endsWith('X'))
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
      position:
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
        if (position.endsWith('LeftX')) {
          setPosition((prev) => {
            return {
              ...prev,
              [position]: between(
                prev[position] + (e.key === 'ArrowRight' ? 1 : -1),
                0,
                100,
              ),
            };
          });
        }
        if (position.endsWith('RightX')) {
          setPosition((prev) => {
            return {
              ...prev,
              [position]: between(
                prev[position] + (e.key === 'ArrowLeft' ? 1 : -1),
                0,
                100,
              ),
            };
          });
        }
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (position.startsWith('top') && position.endsWith('Y')) {
          setPosition((prev) => {
            return {
              ...prev,
              [position]: between(
                prev[position] + (e.key === 'ArrowDown' ? 1 : -1),
                0,
                100,
              ),
            };
          });
        }
        if (position.startsWith('bottom') && position.endsWith('Y')) {
          setPosition((prev) => {
            return {
              ...prev,
              [position]: between(
                prev[position] + (e.key === 'ArrowUp' ? 1 : -1),
                0,
                100,
              ),
            };
          });
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
