// 要素ごとの外部リファレンスURL（WHATWG HTML Standard）を組み立てる。

// WHATWG HTML Standard の elements index を出典とする。
export const SPEC_INDEX_URL =
  'https://html.spec.whatwg.org/multipage/indices.html#elements-3';

// 仕様の定義セクションは要素ごとに別チャプターだが、multipage の
// フラグメントリンクは ID から該当章へ解決される。h1〜h6 と sub/sup だけ
// 1セクションにまとまっているため、そのフラグメントを上書きする。
const SPEC_FRAGMENT_OVERRIDES: Record<string, string> = {
  h1: 'the-h1,-h2,-h3,-h4,-h5,-and-h6-elements',
  h2: 'the-h1,-h2,-h3,-h4,-h5,-and-h6-elements',
  h3: 'the-h1,-h2,-h3,-h4,-h5,-and-h6-elements',
  h4: 'the-h1,-h2,-h3,-h4,-h5,-and-h6-elements',
  h5: 'the-h1,-h2,-h3,-h4,-h5,-and-h6-elements',
  h6: 'the-h1,-h2,-h3,-h4,-h5,-and-h6-elements',
  sub: 'the-sub-and-sup-elements',
  sup: 'the-sub-and-sup-elements',
};

// svg / math は HTML 仕様の elements index が外部仕様（SVG2 / MathML Core）を
// 参照しているため、その参照先 URL をそのまま用いる。
const SPEC_URL_OVERRIDES: Record<string, string> = {
  svg: 'https://w3c.github.io/svgwg/svg2-draft/struct.html#elementdef-svg',
  math: 'https://w3c.github.io/mathml-core/#the-top-level-math-element',
};

export const specUrl = (tag: string): string => {
  const override = SPEC_URL_OVERRIDES[tag];
  if (override !== undefined) {
    return override;
  }
  const fragment = SPEC_FRAGMENT_OVERRIDES[tag] ?? `the-${tag}-element`;
  return `https://html.spec.whatwg.org/multipage/#${fragment}`;
};
