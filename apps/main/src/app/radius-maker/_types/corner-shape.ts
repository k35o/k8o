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

declare module 'react' {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentationはinterfaceでないと既存型にマージされない
  interface CSSProperties {
    cornerShape?: CornerShape | undefined;
  }
}
