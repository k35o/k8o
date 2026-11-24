// デッキのファイルは、ストアの talks/<slug>/ と、main がビルドの前に写す public/talks/<slug>/ に同じ名前で置く
export const PDF_DECK_MANIFEST = 'deck.json';
export const PDF_PAGE_WIDTHS = [960, 1920] as const;

// 元の PDF。保管のためにストアにだけ置き、サイトには出さない
export const PDF_DECK_SOURCE = 'deck.pdf';

// slug はストアのパスと /talks/<slug> の URL にそのまま入る
export const isPdfDeckSlug = (value: string): boolean =>
  /^[a-z0-9-]+$/u.test(value);

export const pdfDeckBlobPrefix = (slug: string): string => `talks/${slug}/`;

// page は 1 始まり
export const pdfPageImage = (
  page: number,
  width: (typeof PDF_PAGE_WIDTHS)[number],
): string =>
  `pages/${page.toString().padStart(3, '0')}.${width.toString()}w.avif`;
