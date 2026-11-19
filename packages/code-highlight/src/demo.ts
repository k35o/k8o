export const DEMO_TAG = 'code-demo';

// 名前は書き出す例の URL の区間になる
const DEMO_NAME = /^[a-z0-9-]+$/u;

// 否定文字クラス + * のみで組み、多項式バックトラッキングを避ける (CodeQL: js/polynomial-redos)
const DEMO_META = /(?:^|\s)demo=(?:"([^"]*)"|'([^']*)')/u;

// コードフェンスのメタ (```html demo="dots") から、動かす例の名前を取り出す
export const parseDemoName = (
  meta: string | null | undefined,
): string | undefined => {
  if (meta === null || meta === undefined) return undefined;
  const matched = DEMO_META.exec(meta);
  if (matched === null) return undefined;
  const name = matched[1] ?? matched[2] ?? '';
  if (!DEMO_NAME.test(name)) {
    throw new Error(
      `demo の名前は小文字の英数字とハイフンで書く: demo="${name}"`,
    );
  }
  return name;
};

// 例の iframe に渡せるブラウザの権限。記事の側の iframe の allow 属性になる
export const DEMO_PERMISSIONS = [
  'clipboard-read',
  'clipboard-write',
  'screen-wake-lock',
] as const;

export type DemoPermission = (typeof DEMO_PERMISSIONS)[number];

const DEMO_ALLOW_META = /(?:^|\s)allow=(?:"([^"]*)"|'([^']*)')/u;

const isDemoPermission = (value: string): value is DemoPermission =>
  DEMO_PERMISSIONS.some((permission) => permission === value);

// コードフェンスのメタ (```js demo="copy" allow="clipboard-read clipboard-write") から、例に渡す権限を取り出す
export const parseDemoAllow = (
  meta: string | null | undefined,
): DemoPermission[] => {
  if (meta === null || meta === undefined) return [];
  const matched = DEMO_ALLOW_META.exec(meta);
  if (matched === null) return [];
  const names = (matched[1] ?? matched[2] ?? '').split(' ').filter(Boolean);
  return names.map((name) => {
    if (!isDemoPermission(name)) {
      throw new Error(
        `allow に書ける権限は ${DEMO_PERMISSIONS.join('・')} だけ: allow="${name}"`,
      );
    }
    return name;
  });
};
