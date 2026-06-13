// CSSのcorner-shapeで指定できる角の形状(superellipseは引数が必要なため除外)
export const CORNER_SHAPES = [
  'round',
  'squircle',
  'bevel',
  'scoop',
  'notch',
] as const;

export type CornerShape = (typeof CORNER_SHAPES)[number];

export const CORNER_SHAPE_LABELS: Record<CornerShape, string> = {
  round: 'まる(標準)',
  squircle: 'スクワークル',
  bevel: '面取り',
  scoop: 'えぐり',
  notch: '切り欠き',
};

// corner-shapeはcsstypeに未定義のため、style属性で使えるように拡張する
declare module 'react' {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentationはinterfaceでないと既存型にマージされない
  interface CSSProperties {
    cornerShape?: CornerShape | undefined;
  }
}
