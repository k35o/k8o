import type { CornerRadius, RadiusCorners } from '../_types/corner-radius';

type RadiusPreset = {
  name: string;
  corners: RadiusCorners;
};

const uniform = (value: CornerRadius): RadiusCorners => ({
  topLeft: value,
  topRight: value,
  bottomRight: value,
  bottomLeft: value,
});

// 初期表示にも使う有機的なブロブ形状
export const BLOB_CORNERS: RadiusCorners = {
  topLeft: { x: 30, y: 30 },
  topRight: { x: 70, y: 30 },
  bottomRight: { x: 70, y: 70 },
  bottomLeft: { x: 30, y: 70 },
};

export const RADIUS_PRESETS: RadiusPreset[] = [
  { name: '四角', corners: uniform({ x: 0, y: 0 }) },
  { name: '角丸', corners: uniform({ x: 15, y: 15 }) },
  { name: '円', corners: uniform({ x: 50, y: 50 }) },
  {
    name: 'たまご',
    corners: {
      topLeft: { x: 50, y: 60 },
      topRight: { x: 50, y: 60 },
      bottomRight: { x: 50, y: 40 },
      bottomLeft: { x: 50, y: 40 },
    },
  },
  {
    name: 'しずく',
    corners: {
      topLeft: { x: 50, y: 50 },
      topRight: { x: 50, y: 50 },
      bottomRight: { x: 50, y: 50 },
      bottomLeft: { x: 0, y: 0 },
    },
  },
  {
    name: 'はっぱ',
    corners: {
      topLeft: { x: 50, y: 50 },
      topRight: { x: 0, y: 0 },
      bottomRight: { x: 50, y: 50 },
      bottomLeft: { x: 0, y: 0 },
    },
  },
  {
    name: '上丸',
    corners: {
      topLeft: { x: 50, y: 50 },
      topRight: { x: 50, y: 50 },
      bottomRight: { x: 0, y: 0 },
      bottomLeft: { x: 0, y: 0 },
    },
  },
  { name: 'ブロブ', corners: BLOB_CORNERS },
];
