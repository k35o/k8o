import { useAppState } from '@k8ordo/state';
import { between } from '@repo/helpers/number/between';
import { useCallback } from 'react';

import type {
  Axis,
  Corner,
  RadiusCorners,
} from '../corner-radius/corner-radius';
import type { CornerShape } from '../corner-shape/corner-shape';
import { BLOB_CORNERS } from '../presets/presets';
import {
  PREVIEW_SIZE,
  parseCorners,
  radiusMakerState,
  readRadiusUrl,
  serializeCorners,
} from '../search-params/search-params';

export const useRadiusState = () => {
  const [url, update] = useAppState(radiusMakerState);
  const { corners, width, height } = readRadiusUrl(url);

  const setCornerValue = useCallback(
    (corner: Corner, axis: Axis, value: number) => {
      const nextValue = between(Math.round(value), 0, 100);
      update((current) => {
        const now = parseCorners(current.r) ?? BLOB_CORNERS;
        return {
          r: serializeCorners({
            ...now,
            [corner]: { ...now[corner], [axis]: nextValue },
          }),
        };
      });
    },
    [update],
  );

  const setCorners = useCallback(
    (nextCorners: RadiusCorners) => {
      update({ r: serializeCorners(nextCorners) });
    },
    [update],
  );

  const setWidth = useCallback(
    (value: number) => {
      update({
        w: String(
          between(Math.round(value), PREVIEW_SIZE.min, PREVIEW_SIZE.max),
        ),
      });
    },
    [update],
  );

  const setHeight = useCallback(
    (value: number) => {
      update({
        h: String(
          between(Math.round(value), PREVIEW_SIZE.min, PREVIEW_SIZE.max),
        ),
      });
    },
    [update],
  );

  const setShape = useCallback(
    (value: CornerShape) => {
      update({ s: value });
    },
    [update],
  );

  return {
    corners,
    width,
    height,
    shape: url.s,
    setCornerValue,
    setCorners,
    setWidth,
    setHeight,
    setShape,
  };
};
