// 記事の動く例（/blog/:slug/demos/:demo）の iframe と記事のあいだでやりとりする postMessage の形。
// iframe は sandbox で origin を持たないので、送る相手は event.source で確かめる
export const DEMO_MESSAGE = {
  ready: 'k8o-demo:ready',
  height: 'k8o-demo:height',
  colorScheme: 'k8o-demo:color-scheme',
} as const;

export type DemoFrameMessage =
  | { type: typeof DEMO_MESSAGE.ready }
  | { type: typeof DEMO_MESSAGE.height; height: number };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const readDemoFrameMessage = (
  data: unknown,
): DemoFrameMessage | undefined => {
  if (!isRecord(data)) return undefined;
  if (data['type'] === DEMO_MESSAGE.ready) {
    return { type: DEMO_MESSAGE.ready };
  }
  const { height } = data;
  if (
    data['type'] === DEMO_MESSAGE.height &&
    typeof height === 'number' &&
    Number.isFinite(height) &&
    height >= 0
  ) {
    return { type: DEMO_MESSAGE.height, height };
  }
  return undefined;
};
