import { useAppState } from '@k8ordo/state';
import { between } from '@repo/helpers/number/between';

import { useUrlDraft } from '@/shared/browser/use-url-draft';

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
  const [committed, update] = useAppState(radiusMakerState);
  const { values, change, commit, commitProps } = useUrlDraft(
    committed,
    update,
  );
  const { corners, width, height } = readRadiusUrl(values);

  const setCornerValue = (corner: Corner, axis: Axis, value: number): void => {
    const nextValue = between(Math.round(value), 0, 100);
    change((current) => {
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
    commit({ r: serializeCorners(nextCorners) });
  };

  const setWidth = (value: number): void => {
    change({
      w: String(between(Math.round(value), PREVIEW_SIZE.min, PREVIEW_SIZE.max)),
    });
  };

  const setHeight = (value: number): void => {
    change({
      h: String(between(Math.round(value), PREVIEW_SIZE.min, PREVIEW_SIZE.max)),
    });
  };

  const setShape = (value: CornerShape): void => {
    commit({ s: value });
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
    commitProps,
  };
};
