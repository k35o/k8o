import { defineLocales } from '@k8ordo/i18n';

/**
 * 呼び出しが集合の登録になる。@k8ordo/ui の組み込み文言はこの集合のロケールで描かれ、
 * 集合が無い環境では英語になる。ブラウザでは framework の入口がこのファイルを読むが、
 * サーバーの描画は読まないので routes/layout.tsx が読み込み、framework を通らない
 * Storybook は .storybook/preview.tsx が読み込む。
 * export は、framework が生成する .k8ordo/register.gen.ts が型で読む。.k8ordo は git に
 * 入れないので、knip からは使われていないように見える
 * @lintignore
 */
export const locales = defineLocales({
  ja: { timeZone: 'Asia/Tokyo', dir: 'ltr' },
});
