import {
  createParser,
  parseAsInteger,
  parseAsStringLiteral,
} from 'nuqs/server';

import type { RadiusCorners } from '../_types/corner-radius';
import { CORNER_SHAPES } from '../_types/corner-shape';
import { BLOB_CORNERS } from './presets';
import { cornersEqual } from './radius-css';

export const PREVIEW_SIZE = {
  min: 80,
  max: 320,
  default: 192,
} as const;

const isRadiusValue = (value: number): boolean =>
  Number.isInteger(value) && value >= 0 && value <= 100;

const parseCorners = (query: string): RadiusCorners | null => {
  const values = query.split(',').map(Number);
  if (values.length !== 8 || !values.every((value) => isRadiusValue(value))) {
    return null;
  }
  const [
    topLeftX = 0,
    topLeftY = 0,
    topRightX = 0,
    topRightY = 0,
    bottomRightX = 0,
    bottomRightY = 0,
    bottomLeftX = 0,
    bottomLeftY = 0,
  ] = values;
  return {
    topLeft: { x: topLeftX, y: topLeftY },
    topRight: { x: topRightX, y: topRightY },
    bottomRight: { x: bottomRightX, y: bottomRightY },
    bottomLeft: { x: bottomLeftX, y: bottomLeftY },
  };
};

const serializeCorners = (corners: RadiusCorners): string =>
  [
    corners.topLeft.x,
    corners.topLeft.y,
    corners.topRight.x,
    corners.topRight.y,
    corners.bottomRight.x,
    corners.bottomRight.y,
    corners.bottomLeft.x,
    corners.bottomLeft.y,
  ].join(',');

export const radiusMakerParsers = {
  corners: createParser({
    parse: parseCorners,
    serialize: serializeCorners,
    eq: cornersEqual,
  }).withDefault(BLOB_CORNERS),
  width: parseAsInteger.withDefault(PREVIEW_SIZE.default),
  height: parseAsInteger.withDefault(PREVIEW_SIZE.default),
  shape: parseAsStringLiteral(CORNER_SHAPES).withDefault('round'),
};

export const radiusMakerUrlKeys = {
  corners: 'r',
  width: 'w',
  height: 'h',
  shape: 's',
} as const;
