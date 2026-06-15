import { between } from '@repo/helpers/number/between';
import { throttle, useQueryStates } from 'nuqs';
import { useCallback } from 'react';

import type { Axis, Corner, RadiusCorners } from '../../_types/corner-radius';
import type { CornerShape } from '../../_types/corner-shape';
import {
  PREVIEW_SIZE,
  radiusMakerParsers,
  radiusMakerUrlKeys,
} from '../../_utils/search-params';

export const useRadiusState = () => {
  const [{ corners, width, height, shape }, setState] = useQueryStates(
    radiusMakerParsers,
    {
      history: 'replace',
      limitUrlUpdates: throttle(200),
      urlKeys: radiusMakerUrlKeys,
    },
  );

  const setCornerValue = useCallback(
    (corner: Corner, axis: Axis, value: number) => {
      const nextValue = between(Math.round(value), 0, 100);
      void setState((prev) => ({
        corners: {
          ...prev.corners,
          [corner]: { ...prev.corners[corner], [axis]: nextValue },
        },
      }));
    },
    [setState],
  );

  const setCorners = useCallback(
    (nextCorners: RadiusCorners) => {
      void setState({ corners: nextCorners });
    },
    [setState],
  );

  const setWidth = useCallback(
    (value: number) => {
      void setState({
        width: between(Math.round(value), PREVIEW_SIZE.min, PREVIEW_SIZE.max),
      });
    },
    [setState],
  );

  const setHeight = useCallback(
    (value: number) => {
      void setState({
        height: between(Math.round(value), PREVIEW_SIZE.min, PREVIEW_SIZE.max),
      });
    },
    [setState],
  );

  const setShape = useCallback(
    (value: CornerShape) => {
      void setState({ shape: value });
    },
    [setState],
  );

  return {
    corners,
    width: between(width, PREVIEW_SIZE.min, PREVIEW_SIZE.max),
    height: between(height, PREVIEW_SIZE.min, PREVIEW_SIZE.max),
    shape,
    setCornerValue,
    setCorners,
    setWidth,
    setHeight,
    setShape,
  };
};
