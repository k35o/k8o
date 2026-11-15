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
