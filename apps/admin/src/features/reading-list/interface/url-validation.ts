// フィード取得(safeFetch)と公開ページでの href 描画の両方で https 前提のため、
// javascript: 等を拒否して入力時点で https に限定する
export const isHttpsUrl = (value: string): boolean =>
  URL.canParse(value) && new URL(value).protocol === 'https:';
