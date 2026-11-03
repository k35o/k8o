import { defineLocales } from '@k8ordo/i18n';

/**
 * 呼び出しが集合の登録になる。@k8ordo/ui の組み込み文言はこの集合のロケールで描かれ、
 * 集合が無い環境では英語になるので、サーバーの描画（routes/layout.tsx）と
 * ブラウザ（components/site/app-provider.tsx）の両方で読み込む。
 * export は、framework が生成する .k8ordo/register.gen.ts が型で読む。.k8ordo は git に
 * 入れないので、knip からは使われていないように見える
 * @lintignore
 */
export const locales = defineLocales({
  ja: { timeZone: 'Asia/Tokyo', dir: 'ltr' },
});
