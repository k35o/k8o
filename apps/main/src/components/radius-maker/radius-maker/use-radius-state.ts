import { useAppState } from '@k8ordo/state';
import { between } from '@repo/helpers/number/between';

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
  const [values, update] = useAppState(radiusMakerState);
  const { corners, width, height } = readRadiusUrl(values);

  const setCornerValue = (corner: Corner, axis: Axis, value: number): void => {
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
  };

  const setCorners = (nextCorners: RadiusCorners): void => {
    update({ r: serializeCorners(nextCorners) });
  };

  const setWidth = (value: number): void => {
    update({
      w: String(between(Math.round(value), PREVIEW_SIZE.min, PREVIEW_SIZE.max)),
    });
  };

  const setHeight = (value: number): void => {
    update({
      h: String(between(Math.round(value), PREVIEW_SIZE.min, PREVIEW_SIZE.max)),
    });
  };

  const setShape = (value: CornerShape): void => {
    update({ s: value });
  };

  return {
    corners,
    width,
    height,
    shape: values.s,
    setCornerValue,
    setCorners,
    setWidth,
    setHeight,
    setShape,
  };
};
