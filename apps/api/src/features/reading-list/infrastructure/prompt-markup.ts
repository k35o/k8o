// 記事の題や本文は外から来る。プロンプトの中でタグを閉じて、別の記事や指示に見せかけられないよう、
// 区切りの字を実体参照にする
export const escapeMarkup = (text: string): string =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
